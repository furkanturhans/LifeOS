import { NextResponse } from 'next/server';
import { InstructorRegistry } from '@/lib/education/InstructorRegistry';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.fullName || !body.expertiseArea || !body.bio) {
      return NextResponse.json(
        { success: false, message: 'Lütfen tüm zorunlu başvuru alanlarını doldurunuz.' },
        { status: 400 }
      );
    }

    const result = InstructorRegistry.submitApplication({
      applicantLifeosId: body.applicantLifeosId || 'user_local',
      fullName: body.fullName,
      expertiseArea: body.expertiseArea,
      educationLevel: body.educationLevel || 'bachelor',
      bio: body.bio,
      teachingCategories: Array.isArray(body.teachingCategories) ? body.teachingCategories : ['Genel'],
    });

    return NextResponse.json({
      success: true,
      application: result.application,
      message: 'Eğitmenlik başvurunuz başarıyla alındı ve incelemeye iletildi.',
    });
  } catch (error) {
    console.error('Instructor application API error:', error);
    return NextResponse.json(
      { success: false, message: 'Başvuru işlenirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = InstructorRegistry.getStatus('user_local');
  return NextResponse.json({
    status: 'ok',
    currentInstructorStatus: status,
    service: 'LifeOS Education Instructor Registry',
  });
}
