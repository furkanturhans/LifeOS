import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class ExploreError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export async function exploreSession(request?: Request) {
  if (request && request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) throw new ExploreError(403, 'FORBIDDEN');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || /placeholder|your[_-]/.test(url)) throw new ExploreError(503, 'SETUP_REQUIRED');
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ExploreError(401, 'SIGN_IN');
  const owner = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!owner) throw new ExploreError(409, 'PROFILE_REQUIRED');
  // Slot zero is the only publicly available profile. Never accept a client slot or owner ID.
  const profile = await prisma.exploreProfile.upsert({
    where: { userId_slot: { userId: owner.id, slot: 0 } },
    create: { userId: owner.id, slot: 0 }, update: {},
  });
  return { supabase, owner, profile, authId: user.id };
}
export function exploreFailure(error: unknown) {
  if (error instanceof ExploreError) return NextResponse.json({ error: error.code }, { status: error.status });
  console.error('Explore request failed:', error instanceof Error ? error.name : 'unknown');
  return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });
}
export function checkedText(value: unknown, limit: number) {
  if (typeof value !== 'string' || value.trim().length > limit) throw new ExploreError(400, 'INVALID_TEXT');
  return value.trim();
}
