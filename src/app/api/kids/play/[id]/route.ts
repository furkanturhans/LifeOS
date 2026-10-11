import fs from 'node:fs/promises';
import path from 'node:path';
import { dataDirectory, allContent } from '@/lib/kids/repository';
import { isKidsAdmin } from '@/lib/kids/access';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const { content } = await allContent();
    if (!content.some(item => item.gameUrl === '/api/kids/play/' + id && item.status === 'published' && item.reviewed) && !await isKidsAdmin()) return new Response(null, { status: 404 });
    const html = await fs.readFile(path.join(dataDirectory(), 'games', id + '.html'));
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data: blob:; connect-src 'none'; base-uri 'none'; form-action 'none'; sandbox allow-scripts" } });
  } catch { return new Response(null, { status: 404 }); }
}
