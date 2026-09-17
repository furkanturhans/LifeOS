import { NextResponse } from 'next/server';
import { ExamEngineProvider } from '@/lib/education/ExamEngineProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, learnerId, learnerName } = body;

    if (!examId || !learnerId) {
      return NextResponse.json(
        { success: false, error: 'examId ve learnerId zorunludur.' },
        { status: 400 }
      );
    }

    const result = ExamEngineProvider.startAttempt(
      examId,
      learnerId,
      learnerName || 'Öğrenci'
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      attempt: result.attempt,
      exam: result.exam,
      serverTime: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sınav oturumu başlatılırken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
