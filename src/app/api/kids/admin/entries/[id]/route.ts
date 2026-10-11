import fs from 'node:fs/promises';
import path from 'node:path';
import { isKidsAdmin } from '@/lib/kids/access';
import { dataDirectory, readDatabase } from '@/lib/kids/repository';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isKidsAdmin()) return new Response(null, { status: 403 });
  const { id } = await params; if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try { const database = await readDatabase(); const entry = database.entries.find(item => item.id === id); if (!entry || entry.image !== id + '.png') return new Response(null, { status: 404 });
    return new Response(await fs.readFile(path.join(dataDirectory(), 'entries', entry.image)), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } });
  } catch { return new Response(null, { status: 404 }); }
}
