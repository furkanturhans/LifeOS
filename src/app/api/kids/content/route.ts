import { NextResponse } from 'next/server';
import { allContent } from '@/lib/kids/repository';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const { content, database } = await allContent();
    // Drafts, parent identities, proposals and contest entries never reach the child catalog.
    return NextResponse.json({ content: content.filter(item => item.status === 'published' && item.reviewed), contests: database.contests.filter(item => item.status === 'open' && Date.parse(item.deadline) > Date.now()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Çocuk içerikleri şu anda yüklenemiyor.' }, { status: 503 }); }
}
