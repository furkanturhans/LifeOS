import { NextResponse } from 'next/server';
import { liveSessionsRegistry } from '../route';
import { bbbProvider } from '@/lib/education/BigBlueButtonProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, instructorId, instructorDisplayName } = body;

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

    if (session.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'İptal edilmiş bir canlı ders başlatılamaz.' },
        { status: 400 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Tamamlanmış bir canlı ders yeniden başlatılamaz.' },
        { status: 400 }
      );
    }

    // 2. Instructor Authorization
    if (instructorId && session.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: 'Yalnızca bu dersin eğitmeni oturumu başlatabilir.' },
        { status: 403 }
      );
    }

    // 3. Strict BigBlueButton configuration check
    if (!bbbProvider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          isConfigured: false,
          session,
          message: 'BigBlueButton sunucusu henüz yapılandırılmadı. Gerçek canlı ders başlatabilmek için sunucu ortam değişkenlerinde BBB_BASE_URL ve BBB_SECRET tanımlanmalıdır.',
        },
        { status: 400 }
      );
    }

    const meetingId = session.bbbMeetingId || `bbb_${session.id}`;
    session.bbbMeetingId = meetingId;

    // 4. Create Real Meeting on BigBlueButton (Idempotent)
    const createResult = await bbbProvider.createMeeting({
      meetingId,
      meetingName: session.title,
      attendeePW: session.attendeePW,
      moderatorPW: session.moderatorPW,
      maxParticipants: session.maxParticipants || 70,
    });

    if (!createResult.success) {
      return NextResponse.json(
        {
          success: false,
          isConfigured: true,
          session,
          message: createResult.message || 'BigBlueButton üzerinde toplantı odası oluşturulamadı.',
        },
        { status: 502 }
      );
    }

    // 5. Update session status to 'live' ONLY after room is confirmed on BBB
    session.attendeePW = createResult.attendeePW;
    session.moderatorPW = createResult.moderatorPW;
    session.status = 'live';
    session.updatedAt = new Date().toISOString();

    // 6. Generate Moderator Join URL
    const joinResult = bbbProvider.getJoinUrl({
      meetingId,
      userId: instructorId || 'inst_moderator',
      fullName: instructorDisplayName || session.instructorName || 'Eğitmen',
      isModerator: true,
      password: session.moderatorPW,
    });

    return NextResponse.json({
      success: true,
      session,
      isConfigured: true,
      joinUrl: joinResult.joinUrl,
      meetingId,
      message: 'Canlı sınıf oturumu BigBlueButton üzerinde başarıyla başlatıldı.',
    });
  } catch (error) {
    console.error('Live session start API error:', error);
    return NextResponse.json(
      { success: false, message: 'Canlı ders başlatılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
