import { NextResponse } from 'next/server';
import { createAdminSession, isKidsAdmin, sameOrigin, validKey } from '@/lib/kids/access';

export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; since: number }>();
export async function GET() {
  return NextResponse.json({ admin: await isKidsAdmin(), configured: process.env.NODE_ENV !== 'production' || !!process.env.KIDS_ADMIN_KEY }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 5000) return NextResponse.json({ error: 'İstek çok büyük.' }, { status: 413 });
  const address = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local';
  const previous = attempts.get(address);
  if (previous && Date.now() - previous.since < 60000 && previous.count >= 5) return NextResponse.json({ error: 'Bir dakika sonra yeniden deneyin.' }, { status: 429 });
  try {
    const body = await request.json();
    if (typeof body.key !== 'string' || body.key.length > 200 || !await validKey(body.key)) {
      attempts.set(address, { count: previous && Date.now() - previous.since < 60000 ? previous.count + 1 : 1, since: previous && Date.now() - previous.since < 60000 ? previous.since : Date.now() });
      if (attempts.size > 1000) attempts.clear();
      return NextResponse.json({ error: 'Yönetici anahtarı doğrulanamadı.' }, { status: 403 });
    }
    attempts.delete(address);
    const response = NextResponse.json({ admin: true });
    response.cookies.set('lifeos-kids-admin', await createAdminSession(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api/kids', maxAge: 7200 });
    return response;
  } catch { return NextResponse.json({ error: 'İstek işlenemedi.' }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 403 });
  const response = NextResponse.json({ admin: false });
  response.cookies.set('lifeos-kids-admin', '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api/kids', maxAge: 0 }); return response;
}
