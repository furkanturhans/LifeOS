import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exploreSession, exploreFailure, ExploreError, checkedText } from '@/lib/explore/server';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    await exploreSession();
    const { id } = await context.params;
    const post = await prisma.explorePost.findFirst({ where: { id, deletedAt: null } });
    if (!post || (post.kind === 'story' && post.createdAt.getTime() < Date.now()-86400000)) throw new ExploreError(404, 'NOT_FOUND');
    const comments = await prisma.exploreComment.findMany({ where: { postId: id }, take: 50, orderBy: { createdAt: 'desc' },
      include: { profile: { include: { user: { select: { lifeosId: true } } } } } });
    return NextResponse.json({ items: comments.map(c => ({ id: c.id, text: c.text, username: c.profile.user.lifeosId })) });
  } catch (error) { return exploreFailure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { profile } = await exploreSession(request);
    const { id } = await context.params;
    const post = await prisma.explorePost.findFirst({ where: { id, deletedAt: null } });
    if (!post || (post.kind === 'story' && post.createdAt.getTime() < Date.now()-86400000)) throw new ExploreError(404, 'NOT_FOUND');
    const body = await request.json();
    if (body.action === 'like' && typeof body.value === 'boolean') {
      if (body.value) await prisma.exploreLike.upsert({ where: { postId_profileId: { postId: id, profileId: profile.id } }, create: { postId: id, profileId: profile.id }, update: {} });
      else await prisma.exploreLike.deleteMany({ where: { postId: id, profileId: profile.id } });
    } else if (body.action === 'comment') {
      const text = checkedText(body.text, 500);
      if (!text) throw new ExploreError(400, 'INVALID_TEXT');
      const recent = await prisma.exploreComment.count({ where: { profileId: profile.id, createdAt: { gte: new Date(Date.now()-60000) } } });
      if (recent >= 10) throw new ExploreError(429, 'RATE_LIMIT');
      await prisma.exploreComment.create({ data: { postId: id, profileId: profile.id, text } });
    } else if (body.action === 'hide') {
      if (post.profileId !== profile.id) throw new ExploreError(403, 'FORBIDDEN');
      await prisma.explorePost.update({ where: { id }, data: { deletedAt: new Date() } });
    } else throw new ExploreError(400, 'INVALID_ACTION');
    return NextResponse.json({ ok: true });
  } catch (error) { return exploreFailure(error); }
}
