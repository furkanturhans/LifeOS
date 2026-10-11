import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { sameOrigin, signedInUser } from '@/lib/kids/access';
import { dataDirectory, updateDatabase } from '@/lib/kids/repository';
export const runtime = 'nodejs';
const schema = z.object({ contestId: z.string().regex(/^[a-z0-9-]{2,100}$/), alias: z.string().trim().min(2).max(40).regex(/^[\p{L}0-9 -]+$/u), age: z.number().int().min(3).max(7), guardianConsent: z.literal(true), image: z.string().max(2000000).regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/) }).strict();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 403 });
  const user = await signedInUser();
  if (!user) return NextResponse.json({ error: 'Katılım için doğrulanmış ebeveyn hesabı gerekiyor. Hesap bağlantısı kurulana kadar katılım gönderilemez.' }, { status: 401 });
  if (Number(request.headers.get('content-length')) > 2100000) return NextResponse.json({ error: 'Çizim çok büyük.' }, { status: 413 });
  let filename: string | undefined;
  try {
    const result = schema.safeParse(await request.json()); if (!result.success) return NextResponse.json({ error: 'Etkinlik, takma ad, yaş, PNG çizim ve ebeveyn onayı gerekli.' }, { status: 400 });
    const bytes = Buffer.from(result.data.image.split(',')[1], 'base64');
    if (bytes.length < 33 || !bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.subarray(12,16).toString() !== 'IHDR' || bytes.readUInt32BE(16) > 1600 || bytes.readUInt32BE(20) > 1600 || !bytes.readUInt32BE(16) || !bytes.readUInt32BE(20)) return NextResponse.json({ error: 'Çizim en fazla 1600×1600 boyutunda gerçek bir PNG olmalı.' }, { status: 400 });
    const id = randomUUID(); const directory = path.join(dataDirectory(), 'entries'); await fs.mkdir(directory, { recursive: true }); filename = path.join(directory, id + '.png'); await fs.writeFile(filename, bytes, { mode: 0o600, flag: 'wx' });
    await updateDatabase(database => {
      const contest = database.contests.find(item => item.id === result.data.contestId);
      if (!contest || contest.status !== 'open' || Date.parse(contest.deadline) <= Date.now() || result.data.age < contest.ageMin || result.data.age > contest.ageMax) throw new Error('NOT_OPEN');
      if (database.entries.some(item => item.contestId === contest.id && item.userId === user.id)) throw new Error('ALREADY_ENTERED');
      database.entries.push({ id, contestId: contest.id, userId: user.id, alias: result.data.alias, guardianConsent: true, createdAt: new Date().toISOString(), image: id + '.png', status: 'pending' });
    });
    return NextResponse.json({ success: true, status: 'pending' }, { status: 201 });
  } catch (error) {
    if (filename) await fs.unlink(filename).catch(() => {});
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'ALREADY_ENTERED' ? 'Bu etkinliğe bu hesapla zaten katıldınız.' : message === 'NOT_OPEN' ? 'Etkinlik katılıma kapalı veya yaş aralığı uygun değil.' : 'Çizim kaydedilemedi.' }, { status: ['ALREADY_ENTERED','NOT_OPEN'].includes(message) ? 409 : 503 });
  }
}
