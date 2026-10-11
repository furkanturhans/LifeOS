import fs from 'node:fs/promises';
import path from 'node:path';
import { allContent, dataDirectory } from '@/lib/kids/repository';
import { isKidsAdmin } from '@/lib/kids/access';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}\.(svg|png|jpg|webp)$/.test(id)) return new Response(null, { status: 404 });
  try {
    const url = '/api/kids/assets/' + id;
    const { content } = await allContent();
    const published = content.some(item => item.status === 'published' && item.reviewed && (item.image === url || item.pages?.some(page => page.image === url)));
    if (!published && !await isKidsAdmin()) return new Response(null, { status: 404 });
    const bytes = await fs.readFile(path.join(dataDirectory(), 'assets', id));
    const mime: Record<string,string> = { svg:'image/svg+xml', png:'image/png', jpg:'image/jpeg', webp:'image/webp' };
    return new Response(bytes, { headers: { 'Content-Type': mime[id.split('.').at(-1)!], 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Content-Security-Policy':"default-src 'none'; sandbox" } });
  } catch { return new Response(null, { status: 404 }); }
}
