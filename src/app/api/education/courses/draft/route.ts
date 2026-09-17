import { NextResponse } from 'next/server';
import type { CourseDraft } from '@/types/education';

// In-memory course draft registry
const courseDraftsRegistry: CourseDraft[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.title || !body.instructorId) {
      return NextResponse.json(
        { success: false, message: 'Kurs başlığı ve eğitmen kimliği zorunludur.' },
        { status: 400 }
      );
    }

    const draft: CourseDraft = {
      id: body.id || `course_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      instructorId: body.instructorId,
      instructorName: body.instructorName || 'Doğrulanmış Eğitmen',
      title: body.title.trim(),
      description: body.description?.trim() || '',
      category: body.category || 'Genel Gelişim',
      ageGroup: body.ageGroup || 'adult',
      level: body.level || 'all_levels',
      learningGoals: Array.isArray(body.learningGoals) ? body.learningGoals : [],
      coverEmoji: body.coverEmoji || '📘',
      sections: Array.isArray(body.sections) ? body.sections : [],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true, // Always draft in Phase 1
      isPublished: false,
    };

    // Upsert draft
    const existingIndex = courseDraftsRegistry.findIndex((d) => d.id === draft.id);
    if (existingIndex !== -1) {
      // Check ownership
      if (courseDraftsRegistry[existingIndex].instructorId !== draft.instructorId) {
        return NextResponse.json(
          { success: false, message: 'Bu kurs taslağını düzenleme yetkiniz yok.' },
          { status: 403 }
        );
      }
      courseDraftsRegistry[existingIndex] = draft;
    } else {
      courseDraftsRegistry.push(draft);
    }

    return NextResponse.json({
      success: true,
      draft,
      message: 'Kurs taslağı başarıyla kaydedildi.',
    });
  } catch (error) {
    console.error('Course draft save API error:', error);
    return NextResponse.json(
      { success: false, message: 'Kurs taslağı kaydedilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, drafts: [], message: 'Eğitmen kimliği belirtilmelidir.' },
        { status: 400 }
      );
    }

    // Return only drafts belonging to requested instructor
    const drafts = courseDraftsRegistry.filter((d) => d.instructorId === instructorId);

    return NextResponse.json({
      success: true,
      drafts,
      count: drafts.length,
    });
  } catch (error) {
    console.error('Course draft get API error:', error);
    return NextResponse.json(
      { success: false, drafts: [], message: 'Taslaklar alınırken hata oluştu.' },
      { status: 500 }
    );
  }
}
