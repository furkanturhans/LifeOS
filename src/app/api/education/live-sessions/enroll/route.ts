import { NextResponse } from 'next/server';
import type { LiveSessionRegistration } from '@/types/education';
import { liveSessionsRegistry, liveRegistrationsRegistry } from '../route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, learnerId, learnerDisplayName } = body;

    if (!sessionId || !learnerId) {
      return NextResponse.json(
        { success: false, message: 'Ders kimliği ve öğrenci kimliği zorunludur.' },
        { status: 400 }
      );
    }

    // 1. Locate live session
    const session = liveSessionsRegistry.find((s) => s.id === sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Canlı ders bulunamadı.' },
        { status: 404 }
      );
    }

    if (session.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Bu canlı ders iptal edilmiştir.' },
        { status: 400 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Bu canlı ders tamamlanmıştır.' },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate enrollment
    const existingRegistration = liveRegistrationsRegistry.find(
      (r) => r.sessionId === sessionId && r.learnerId === learnerId && r.status === 'confirmed'
    );

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, message: 'Bu canlı derse zaten kayıtlısınız.' },
        { status: 400 }
      );
    }

    // 3. Strict Capacity Check (Max 70 students)
    const maxCapacity = Math.min(70, session.maxParticipants || 70);
    if (session.currentParticipantCount >= maxCapacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Canlı ders kontenjanı dolmuştur (Maksimum ${maxCapacity} öğrenci).`,
        },
        { status: 400 }
      );
    }

    // 4. Atomic spot increment
    session.currentParticipantCount += 1;
    session.updatedAt = new Date().toISOString();

    // 5. Create immutable registration record
    const registration: LiveSessionRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.id,
      sessionTitle: session.title,
      instructorName: session.instructorName,
      scheduledAt: session.scheduledAt,
      learnerId,
      learnerDisplayName: learnerDisplayName || 'Öğrenci',
      creditsPaid: session.creditsRequired || 50,
      enrolledAt: new Date().toISOString(),
      status: 'confirmed',
    };

    liveRegistrationsRegistry.unshift(registration);

    return NextResponse.json({
      success: true,
      registration,
      session,
      message: `${session.creditsRequired || 50} kredi karşılığında canlı derse başarıyla kaydoldunuz.`,
    });
  } catch (error) {
    console.error('Live session enroll API error:', error);
    return NextResponse.json(
      { success: false, message: 'Canlı derse kayıt olunurken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
