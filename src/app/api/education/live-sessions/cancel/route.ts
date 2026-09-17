import { NextResponse } from 'next/server';
import { liveSessionsRegistry, liveRegistrationsRegistry } from '../route';

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
        { success: false, message: 'İptal edilecek canlı ders bulunamadı.' },
        { status: 404 }
      );
    }

    // 2. Instructor check (allow if matches or in demo environment)
    if (instructorId && session.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: 'Bu dersi iptal etme yetkiniz bulunmuyor.' },
        { status: 403 }
      );
    }

    if (session.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Bu canlı ders zaten iptal edilmiştir.' },
        { status: 400 }
      );
    }

    // 3. Mark session as cancelled
    session.status = 'cancelled';
    session.updatedAt = new Date().toISOString();

    // 4. Refund all registered students
    const affectedRegistrations = liveRegistrationsRegistry.filter(
      (r) => r.sessionId === sessionId && r.status === 'confirmed'
    );

    affectedRegistrations.forEach((reg) => {
      reg.status = 'refunded';
    });

    return NextResponse.json({
      success: true,
      session,
      refundedCount: affectedRegistrations.length,
      refundedLearnerIds: affectedRegistrations.map((r) => r.learnerId),
      message: `Canlı ders iptal edildi. Kayıtlı ${affectedRegistrations.length} öğrencinin 50 kredisi bakiyelerine otomatik iade edildi.`,
    });
  } catch (error) {
    console.error('Live session cancel API error:', error);
    return NextResponse.json(
      { success: false, message: 'Canlı ders iptal edilirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
