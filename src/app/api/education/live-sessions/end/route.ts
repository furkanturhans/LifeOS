import { NextResponse } from 'next/server';
import { liveSessionsRegistry } from '../route';
import { bbbProvider } from '@/lib/education/BigBlueButtonProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, instructorId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Ders kimliği zorunludur.' },
        { status: 400 }
      );
    }

    // 1. Locate session
    const session = liveSessionsRegistry.find((s) => s.id === sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Canlı ders bulunamadı.' },
        { status: 404 }
      );
    }

    // 2. Authorization
    if (instructorId && session.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: 'Yalnızca bu dersin eğitmeni oturumu sonlandırabilir.' },
        { status: 403 }
      );
    }

    // 3. End Meeting on BigBlueButton if meeting was created
    if (session.bbbMeetingId && session.moderatorPW) {
      await bbbProvider.endMeeting({
        meetingId: session.bbbMeetingId,
        moderatorPW: session.moderatorPW,
      });
    }

    // 4. Update session status
    session.status = 'completed';
    session.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      session,
      message: 'Canlı ders oturumu başarıyla tamamlandı ve kapatıldı.',
    });
  } catch (error) {
    console.error('Live session end API error:', error);
    return NextResponse.json(
      { success: false, message: 'Canlı ders kapatılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
