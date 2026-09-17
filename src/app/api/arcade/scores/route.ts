import { NextResponse } from 'next/server';
import type { ScoreSubmitRequest, ScoreSubmitResponse } from '@/types/arcade';

// Server-side in-memory score registry (can be wired to Prisma DB when ready)
interface ServerScoreRecord {
  id: string;
  sessionId: string;
  gameId: string;
  score: number;
  displayName: string;
  timestamp: string;
}

const scoresRegistry: ServerScoreRecord[] = [];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScoreSubmitRequest;

    if (!body || !body.session || !body.session.gameId) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz oyun oturumu verisi.' },
        { status: 400 }
      );
    }

    const { session, displayName = 'LifeOS Oyuncusu' } = body;

    // Validate score bounds for safety
    if (typeof session.score !== 'number' || session.score < 0 || session.score > 50000) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz skor değeri.' },
        { status: 400 }
      );
    }

    // Sanitize display name (strip PII / HTML)
    const sanitizedName = displayName
      .replace(/<[^>]*>?/gm, '')
      .slice(0, 24)
      .trim() || 'LifeOS Oyuncusu';

    const record: ServerScoreRecord = {
      id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId: session.sessionId,
      gameId: session.gameId,
      score: session.score,
      displayName: sanitizedName,
      timestamp: session.completedAt || new Date().toISOString(),
    };

    scoresRegistry.push(record);

    const response: ScoreSubmitResponse = {
      success: true,
      recordedSession: session,
      unlockedAchievements: [],
      completedQuests: [],
      message: 'Skor başarıyla kaydedildi.',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Arcade score submit API error:', error);
    return NextResponse.json(
      { success: false, message: 'Skor kaydedilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Returns recent server recorded sessions count & status
  return NextResponse.json({
    status: 'ok',
    totalRecordedScores: scoresRegistry.length,
    service: 'LifeOS Arcade Score Service',
  });
}
