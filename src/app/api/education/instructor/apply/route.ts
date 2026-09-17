import { NextResponse } from 'next/server';
import type { InstructorApplication } from '@/types/education';

// In-memory application registry for development (can be tied to Prisma)
const applicationsRegistry: InstructorApplication[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.fullName || !body.expertiseArea || !body.bio) {
      return NextResponse.json(
        { success: false, message: 'Lütfen tüm zorunlu başvuru alanlarını doldurunuz.' },
        { status: 400 }
      );
    }

    const application: InstructorApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      applicantLifeosId: body.applicantLifeosId || 'user_local',
      fullName: body.fullName.trim(),
      expertiseArea: body.expertiseArea.trim(),
      educationLevel: body.educationLevel || 'bachelor',
      bio: body.bio.trim(),
      teachingCategories: Array.isArray(body.teachingCategories) ? body.teachingCategories : ['Genel'],
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    applicationsRegistry.push(application);

    return NextResponse.json({
      success: true,
      application,
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
  return NextResponse.json({
    status: 'ok',
    totalApplications: applicationsRegistry.length,
    service: 'LifeOS Education Instructor Registry',
  });
}
