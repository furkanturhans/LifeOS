import { NextResponse } from 'next/server';
import { ExamEngineProvider } from '@/lib/education/ExamEngineProvider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attemptId, learnerId, isAutoSubmit } = body;

    if (!attemptId || !learnerId) {
      return NextResponse.json(
        { success: false, error: 'attemptId ve learnerId zorunludur.' },
        { status: 400 }
      );
    }

    const result = ExamEngineProvider.submitAttempt({
      attemptId,
      learnerId,
      isAutoSubmit: Boolean(isAutoSubmit),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      attempt: result.attempt,
      serverTime: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sınav teslim edilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
