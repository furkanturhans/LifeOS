import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { sameOrigin, signedInUser } from '@/lib/kids/access';
import { proposalSchema } from '@/lib/kids/schema';
import { updateDatabase } from '@/lib/kids/repository';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 403 });
  const user = await signedInUser();
  if (!user) return NextResponse.json({ error: 'Başvuru için doğrulanmış ebeveyn hesabıyla giriş gerekli. Hesap bağlantısı kurulana kadar başvuruyu gönderemiyoruz.' }, { status: 401 });
  if (Number(request.headers.get('content-length')) > 10000) return NextResponse.json({ error: 'İstek çok büyük.' }, { status: 413 });
  try {
    const result = proposalSchema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: 'Başlık, açıklama, HTTPS kaynak, lisans bilgisi ve ebeveyn onayı gerekli.' }, { status: 400 });
    const id = randomUUID();
    await updateDatabase(database => {
      if (database.submissions.filter(item => item.userId === user.id && Date.parse(item.createdAt) > Date.now() - 86400000).length >= 5) throw new Error('RATE_LIMIT');
      database.submissions.push({ ...result.data, id, userId: user.id, createdAt: new Date().toISOString(), status: 'pending' });
    });
    return NextResponse.json({ success: true, id, status: 'pending' }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === 'RATE_LIMIT' ? 'Bugün en fazla beş öneri gönderebilirsiniz.' : 'Başvuru kaydedilemedi.' }, { status: error instanceof Error && error.message === 'RATE_LIMIT' ? 429 : 503 }); }
}
