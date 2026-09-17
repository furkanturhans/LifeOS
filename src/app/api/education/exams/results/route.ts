import { NextResponse } from 'next/server';
import { ExamEngineProvider } from '@/lib/education/ExamEngineProvider';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId');
  const learnerId = searchParams.get('learnerId');

  if (instructorId) {
    const results = ExamEngineProvider.getInstructorResults(instructorId);
    return NextResponse.json({
      success: true,
      results,
    });
  }

  if (learnerId) {
    const attempts = ExamEngineProvider.getLearnerAttempts(learnerId);
    return NextResponse.json({
      success: true,
      attempts,
    });
  }

  return NextResponse.json(
    { success: false, error: 'instructorId veya learnerId parametresi gereklidir.' },
    { status: 400 }
  );
}
