import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exploreSession, exploreFailure } from '@/lib/explore/server';

export async function GET() {
  try {
    const { profile } = await exploreSession();
    const where = { post: { profileId: profile.id, deletedAt: null }, profileId: { not: profile.id } };
    const include = { profile: { include: { user: { select: { lifeosId: true } } } } };
    const [likes, comments] = await Promise.all([
      prisma.exploreLike.findMany({ where, include: { ...include, post: { select: { createdAt: true } } }, orderBy: { post: { createdAt: 'desc' } }, take: 30 }),
      prisma.exploreComment.findMany({ where, include, orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);
    const items = [...likes.map(item => ({ id: `like-${item.postId}-${item.profileId}`, kind: 'like', username: item.profile.user.lifeosId, createdAt: item.post.createdAt })),
      ...comments.map(item => ({ id: item.id, kind: 'comment', username: item.profile.user.lifeosId, createdAt: item.createdAt }))]
      .sort((a,b) => b.createdAt.getTime()-a.createdAt.getTime()).slice(0,30);
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return exploreFailure(error); }
}
