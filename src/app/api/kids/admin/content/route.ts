import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isKidsAdmin, sameOrigin } from '@/lib/kids/access';
import { contentSchema, contestSchema } from '@/lib/kids/schema';
import { allContent, dataDirectory, updateDatabase } from '@/lib/kids/repository';
export const runtime = 'nodejs';
export async function GET() {
  if (!await isKidsAdmin()) return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  try { return NextResponse.json(await allContent(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'İçerik deposuna ulaşılamadı.' }, { status: 503 }); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request) || !await isKidsAdmin()) return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 150000) return NextResponse.json({ error: 'İstek çok büyük.' }, { status: 413 });
  try {
    const body = await request.json();
    if (body.action === 'content') {
      const result = contentSchema.safeParse(body.item);
      if (!result.success) return NextResponse.json({ error: result.error.issues.map(issue => issue.message).join(' ') }, { status: 400 });
      const item = result.data;
      const assets = [item.image, item.gameUrl, ...item.pages?.map(page => page.image) ?? []].filter(Boolean) as string[];
      for (const asset of assets) {
        if (asset.startsWith('/api/kids/play/')) { await fs.access(path.join(dataDirectory(), 'games', asset.split('/').at(-1) + '.html')); continue; }
        if (asset.startsWith('/api/kids/assets/')) { await fs.access(path.join(dataDirectory(), 'assets', asset.split('/').at(-1)!)); continue; }
        const filename = path.resolve(process.cwd(), 'public', '.' + asset);
        const boundary = path.resolve(process.cwd(), 'public/kids') + path.sep;
        if (!filename.startsWith(boundary)) return NextResponse.json({ error: 'İçerik dosyası geçersiz.' }, { status: 400 });
        await fs.access(filename);
      }
      await updateDatabase(database => { database.content = [...database.content.filter(entry => entry.id !== item.id), item]; database.audit.push({ at: new Date().toISOString(), action: item.status, item: item.id }); });
    } else if (body.action === 'contest') {
      const result = contestSchema.safeParse(body.item);
      if (!result.success) return NextResponse.json({ error: 'Etkinlik bilgileri eksik veya geçersiz.' }, { status: 400 });
      if (result.data.status === 'open' && Date.parse(result.data.deadline) <= Date.now()) return NextResponse.json({ error: 'Son katılım tarihi gelecekte olmalı.' }, { status: 400 });
      await updateDatabase(database => { database.contests = [...database.contests.filter(entry => entry.id !== result.data.id), result.data]; database.audit.push({ at: new Date().toISOString(), action: 'contest-' + result.data.status, item: result.data.id }); });
    } else if (body.action === 'review-submission' && ['accepted', 'rejected'].includes(body.status)) {
      await updateDatabase(database => { const item = database.submissions.find(entry => entry.id === body.id); if (!item) throw new Error('NOT_FOUND'); item.status = body.status; database.audit.push({ at: new Date().toISOString(), action: 'submission-' + body.status, item: item.id }); });
    } else if (body.action === 'review-entry' && ['accepted', 'rejected', 'winner'].includes(body.status)) {
      await updateDatabase(database => {
        const item = database.entries.find(entry => entry.id === body.id); if (!item) throw new Error('NOT_FOUND');
        const contest = database.contests.find(entry => entry.id === item.contestId); if (!contest) throw new Error('NOT_FOUND');
        if (body.status === 'winner' && (contest.status !== 'closed' || item.status !== 'accepted')) throw new Error('WINNER_REQUIRES_CLOSED_CONTEST_AND_ACCEPTED_ENTRY');
        if (body.status === 'winner') for (const entry of database.entries) if (entry.contestId === item.contestId && entry.status === 'winner') entry.status = 'accepted';
        item.status = body.status; database.audit.push({ at: new Date().toISOString(), action: 'entry-' + body.status, item: item.id });
      });
    } else return NextResponse.json({ error: 'İşlem desteklenmiyor.' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: (error as NodeJS.ErrnoException).code === 'EEXIST' ? 'Başka bir kayıt sürüyor. Yeniden deneyin.' : 'Kayıt yapılamadı. Dosyaları ve depolama ayarlarını kontrol edin.' }, { status: 503 }); }
}
