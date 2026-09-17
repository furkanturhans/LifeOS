import { NextResponse } from 'next/server';
import { ExamEngineProvider } from '@/lib/education/ExamEngineProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, learnerId, questionId, selectedOptionIndex } = body;

    if (!attemptId || !learnerId || !questionId || selectedOptionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'attemptId, learnerId, questionId ve selectedOptionIndex zorunludur.' },
        { status: 400 }
      );
    }

    const result = ExamEngineProvider.saveAnswer({
      attemptId,
      learnerId,
      questionId,
      selectedOptionIndex: Number(selectedOptionIndex),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      remainingSeconds: result.remainingSeconds,
      serverTime: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cevap kaydedilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
