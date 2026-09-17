import { NextResponse } from 'next/server';
import { InstructorRegistry } from '@/lib/education/InstructorRegistry';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId') || 'user_local';

  // Server-side authorization check
  const status = InstructorRegistry.getStatus(instructorId);
  if (!status.isVerified && status.role !== 'instructor_verified') {
    return NextResponse.json(
      {
        success: false,
        error: 'Yetkisiz erişim. Yalnızca doğrulanmış eğitmenler sınıf alanlarını yönetebilir.',
      },
      { status: 403 }
    );
  }

  const classrooms = InstructorRegistry.getInstructorClassrooms(instructorId);

  return NextResponse.json({
    success: true,
    classrooms,
    total: classrooms.length,
  });
}
