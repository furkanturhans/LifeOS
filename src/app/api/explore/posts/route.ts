import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { exploreSession, exploreFailure, ExploreError, checkedText } from '@/lib/explore/server';
import { boundedFormData, mediaFormat, MAX_MEDIA_BYTES } from '@/lib/explore/media';

export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const { profile, owner, supabase } = await exploreSession();
    const params = new URL(request.url).searchParams;
    const cursor = params.get('cursor');
    if (cursor && !/^[a-z0-9-]{1,60}$/i.test(cursor)) throw new ExploreError(400, 'INVALID_CURSOR');
    const query = (params.get('q') ?? '').trim().slice(0,100);
    const stories = params.get('tab') === 'stories';
    const posts = await prisma.explorePost.findMany({
      where: { deletedAt: null, ...(stories ? { kind: 'story', createdAt: { gte: new Date(Date.now()-86400000) } } : { kind: { not: 'story' } }), ...(query ? { OR: [{ text: { contains: query, mode: 'insensitive' as const } }, { profile: { user: { lifeosId: { contains: query, mode: 'insensitive' as const } } } }] } : {}), ...(params.get('tab') === 'shorts' ? { kind: 'short' } : {}), ...(params.get('tab') === 'profile' ? { profileId: profile.id } : {}) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 21,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { profile: { include: { user: { select: { lifeosId: true, displayName: true } } } },
        _count: { select: { likes: true, comments: true } }, likes: { where: { profileId: profile.id }, select: { profileId: true } } },
    });
    const page = posts.slice(0,20);
    const items = await Promise.all(page.map(async post => {
      let mediaUrl: string | null = null;
      if (post.mediaPath) {
        const { data, error } = await supabase.storage.from('explore-media').createSignedUrl(post.mediaPath, 3600);
        if (!error) mediaUrl = data.signedUrl;
      }
      return { id: post.id, text: post.text, kind: post.kind, mediaType: post.mediaType, mediaUrl,
        mediaUnavailable: Boolean(post.mediaPath && !mediaUrl), createdAt: post.createdAt,
        username: post.profile.user.lifeosId, displayName: post.profile.user.displayName,
        own: post.profileId === profile.id, liked: post.likes.length > 0, likes: post._count.likes, comments: post._count.comments };
    }));
    return NextResponse.json({ items, nextCursor: posts.length > 20 ? page.at(-1)?.id : null,
      profile: { username: owner.lifeosId, displayName: owner.displayName } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return exploreFailure(error); }
}

export async function POST(request: Request) {
  let uploaded: string | undefined;
  let storage: Awaited<ReturnType<typeof exploreSession>>['supabase'] | undefined;
  try {
    const session = await exploreSession(request);
    storage = session.supabase;
    if (Number(request.headers.get('content-length') ?? 0) > 52 * 1024 * 1024) throw new ExploreError(413, 'FILE_TOO_LARGE');
    const recent = await prisma.explorePost.count({ where: { profileId: session.profile.id, createdAt: { gte: new Date(Date.now()-60000) } } });
    if (recent >= 5) throw new ExploreError(429, 'RATE_LIMIT');
    let form: FormData;
    try { form = await boundedFormData(request); }
    catch (error) { throw new ExploreError(error instanceof Error && error.message === 'FILE_TOO_LARGE' ? 413 : 400, error instanceof Error && error.message === 'FILE_TOO_LARGE' ? 'FILE_TOO_LARGE' : 'INVALID_MEDIA'); }
    const text = checkedText(form.get('text') ?? '', 2000);
    const kind = form.get('kind') === 'story' ? 'story' : form.get('kind') === 'short' ? 'short' : 'post';
    const file = form.get('file');
    let mediaType: string | undefined;
    if (file instanceof File && file.size) {
      if (file.size > MAX_MEDIA_BYTES) throw new ExploreError(413, 'FILE_TOO_LARGE');
      const bytes = Buffer.from(await file.arrayBuffer());
      // Inspect signatures, not just the user-controlled extension or Content-Type.
      const format = mediaFormat(bytes);
      if (!format) throw new ExploreError(400, 'INVALID_MEDIA');
      mediaType = format.mime;
      if (kind === 'short' && !mediaType.startsWith('video/')) throw new ExploreError(400, 'VIDEO_REQUIRED');
      uploaded = `${session.authId}/${randomUUID()}.${format.extension}`;
      const { error } = await storage.storage.from('explore-media').upload(uploaded, bytes, { contentType: mediaType, upsert: false });
      if (error) throw new ExploreError(503, 'UPLOAD_FAILED');
    }
    if ((!text && !uploaded) || (kind === 'short' && !uploaded)) throw new ExploreError(400, 'EMPTY_POST');
    const post = await prisma.explorePost.create({ data: { profileId: session.profile.id, text, kind, mediaPath: uploaded, mediaType } });
    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (error) {
    if (uploaded && storage) await storage.storage.from('explore-media').remove([uploaded]).catch(() => {});
    return exploreFailure(error);
  }
}
