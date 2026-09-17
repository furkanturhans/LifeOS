import { NextResponse } from 'next/server';
import type { LiveSession, LiveSessionRegistration } from '@/types/education';

// In-memory sessions store (shared across server routes)
export const liveSessionsRegistry: LiveSession[] = [
  {
    id: 'session_ai_101',
    courseId: 'draft_sample_1',
    courseTitle: 'Yapay Zeka ve Python Temelleri',
    instructorId: 'inst_verified_1',
    instructorName: 'Dr. Ahmet Yılmaz',
    instructorAvatar: '👨‍🏫',
    instructorBio: 'Yapay zeka araştırmacısı ve eğitmen',
    title: 'Canlı Uygulama: İlk AI Modelimizi Eğitiyoruz',
    description: 'Python kullanarak temel bir sınıflandırma modelini canlı yayında birlikte kodlayıp test edeceğiz.',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    durationMinutes: 60,
    ageGroup: 'youth',
    creditsRequired: 50,
    maxParticipants: 70,
    currentParticipantCount: 42,
    status: 'scheduled',
    bbbMeetingId: 'bbb_meet_ai_101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'session_math_202',
    instructorId: 'inst_verified_2',
    instructorName: 'Zeynep Öğretmen',
    instructorAvatar: '👩‍🏫',
    instructorBio: 'Olimpiyat matematik mentörü',
    title: 'Hızlı Zihinsel Matematik ve Problem Çözme Taktikleri',
    description: 'Sınavlarda zaman kazandıran pratik hesaplama ve soru analiz teknikleri.',
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days later
    durationMinutes: 45,
    ageGroup: 'child',
    creditsRequired: 50,
    maxParticipants: 70,
    currentParticipantCount: 18,
    status: 'scheduled',
    bbbMeetingId: 'bbb_meet_math_202',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const liveRegistrationsRegistry: LiveSessionRegistration[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');

    let sessions = [...liveSessionsRegistry];

    if (instructorId) {
      sessions = sessions.filter((s) => s.instructorId === instructorId);
    }

    if (status) {
      sessions = sessions.filter((s) => s.status === status);
    }

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Live sessions GET error:', error);
    return NextResponse.json(
      { success: false, sessions: [], message: 'Canlı dersler yüklenemedi.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.title || !body.instructorId || !body.scheduledAt) {
      return NextResponse.json(
        { success: false, message: 'Ders başlığı, eğitmen kimliği ve planlanan tarih zorunludur.' },
        { status: 400 }
      );
    }

    // Strict cap: max participants cannot exceed 70
    const rawLimit = Number(body.maxParticipants) || 70;
    const enforcedLimit = Math.min(70, Math.max(5, rawLimit));

    // Default 50 credits, bounded between 0 and 200
    const rawCredits = Number(body.creditsRequired) !== undefined ? Number(body.creditsRequired) : 50;
    const enforcedCredits = Math.min(200, Math.max(0, rawCredits));

    const session: LiveSession = {
      id: body.id || `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      courseId: body.courseId,
      courseTitle: body.courseTitle,
      instructorId: body.instructorId,
      instructorName: body.instructorName || 'Doğrulanmış Eğitmen',
      instructorAvatar: body.instructorAvatar || '👨‍🏫',
      instructorBio: body.instructorBio || 'LifeOS Eğitmeni',
      title: body.title.trim(),
      description: body.description?.trim() || '',
      scheduledAt: body.scheduledAt,
      durationMinutes: Number(body.durationMinutes) || 45,
      ageGroup: body.ageGroup || 'youth',
      creditsRequired: enforcedCredits,
      maxParticipants: enforcedLimit,
      currentParticipantCount: body.currentParticipantCount || 0,
      status: body.status || 'scheduled',
      bbbMeetingId: `bbb_meet_${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = liveSessionsRegistry.findIndex((s) => s.id === session.id);
    if (existingIndex !== -1) {
      liveSessionsRegistry[existingIndex] = session;
    } else {
      liveSessionsRegistry.unshift(session);
    }

    return NextResponse.json({
      success: true,
      session,
      message: 'Canlı ders başarıyla planlandı.',
    });
  } catch (error) {
    console.error('Live sessions POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Canlı ders kaydedilirken hata oluştu.' },
      { status: 500 }
    );
  }
}
