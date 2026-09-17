import { NextResponse } from 'next/server';
import { ExamEngineProvider } from '@/lib/education/ExamEngineProvider';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const learnerId = searchParams.get('learnerId') || undefined;
  const instructorId = searchParams.get('instructorId') || undefined;
  const isInstructor = searchParams.get('isInstructor') === 'true';

  const exams = ExamEngineProvider.getExams({
    learnerId,
    instructorId,
    isInstructor,
  });

  return NextResponse.json({
    success: true,
    exams,
    total: exams.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      instructorId,
      instructorName,
      courseId,
      courseTitle,
      title,
      description,
      scheduledAt,
      durationMinutes,
      passScorePercent,
      questions,
      role,
    } = body;

    if (role !== 'instructor_verified') {
      return NextResponse.json(
        { success: false, error: 'Yalnızca doğrulanmış eğitmenler sınav oluşturabilir.' },
        { status: 403 }
      );
    }

    const result = ExamEngineProvider.createExam(
      instructorId || 'usr-instructor-ahmet',
      instructorName || 'Prof. Dr. Ahmet Yılmaz',
      {
        courseId,
        courseTitle,
        title,
        description,
        scheduledAt,
        durationMinutes,
        passScorePercent,
        questions,
      }
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      exam: result.exam,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sınav oluşturulurken sunucu hatası meydana geldi.' },
      { status: 500 }
    );
  }
}
