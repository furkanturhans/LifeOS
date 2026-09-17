import { NextResponse } from 'next/server';
import { liveSessionsRegistry, liveRegistrationsRegistry } from '../route';
import { bbbProvider } from '@/lib/education/BigBlueButtonProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, userId, userRole, displayName } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Ders kimliği ve kullanıcı kimliği zorunludur.' },
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
        { success: false, message: 'Bu canlı ders iptal edilmiştir. Katılım sağlanamaz.' },
        { status: 400 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Bu canlı ders sona ermiştir.' },
        { status: 400 }
      );
    }

    const isModerator = userRole === 'instructor_verified' || session.instructorId === userId;

    // 2. If learner, verify registration & capacity limit
    if (!isModerator) {
      const isRegistered = liveRegistrationsRegistry.some(
        (r) => r.sessionId === sessionId && r.learnerId === userId && r.status === 'confirmed'
      );

      if (!isRegistered) {
        return NextResponse.json(
          {
            success: false,
            message: 'Bu canlı derse katılabilmek için önce kaydınızı tamamlamanız gerekmektedir.',
          },
          { status: 403 }
        );
      }

      // Check strictly that limit is not exceeded
      if (session.currentParticipantCount > 70) {
        return NextResponse.json(
          {
            success: false,
            message: 'Sınıf maksimum 70 kişi kapasitesine ulaşmıştır.',
          },
          { status: 400 }
        );
      }
    }

    // 3. Delegate to BigBlueButtonProvider for Join URL
    const meetingId = session.bbbMeetingId || `bbb_${session.id}`;
    const result = bbbProvider.getJoinUrl({
      meetingId,
      userId,
      fullName: displayName || (isModerator ? session.instructorName : 'Öğrenci'),
      isModerator,
      password: isModerator ? session.moderatorPW : session.attendeePW,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Live session join API error:', error);
    return NextResponse.json(
      {
        success: false,
        isConfigured: false,
        message: 'Canlı sınıf bağlantısı oluşturulurken bir hata meydana geldi.',
      },
      { status: 500 }
    );
  }
}
