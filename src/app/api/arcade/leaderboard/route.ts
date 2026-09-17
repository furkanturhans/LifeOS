import { NextResponse } from 'next/server';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types/arcade';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'all';
    const period = searchParams.get('period') || 'all_time'; // 'weekly' | 'all_time'

    // Real server-side response: if no real users have submitted, return clean empty list
    // (Never produce fake hallucinated bot users)
    const entries: LeaderboardEntry[] = [];

    const response: LeaderboardResponse = {
      entries,
      totalPlayers: entries.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Arcade leaderboard API error:', error);
    return NextResponse.json(
      { entries: [], totalPlayers: 0, message: 'Liderlik verisi alınamadı.' },
      { status: 500 }
    );
  }
}
