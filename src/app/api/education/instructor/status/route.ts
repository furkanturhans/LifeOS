import { NextResponse } from 'next/server';
import { InstructorRegistry } from '@/lib/education/InstructorRegistry';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_local';

  const status = InstructorRegistry.getStatus(userId);

  return NextResponse.json({
    success: true,
    ...status,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    if (action === 'verify' && userId) {
      const result = InstructorRegistry.verifyInstructor(userId);
      return NextResponse.json({
        success: true,
        role: 'instructor_verified',
        isVerified: true,
        profile: result.profile,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Geçersiz işlem.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Eğitmen durumu işlenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
