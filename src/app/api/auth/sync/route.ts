import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, supabaseId, userMetadata } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-posta belirtilmedi.' }, { status: 400 });
    }

    try {
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email }, ...(supabaseId ? [{ supabaseId }] : [])],
        },
      });

      if (!user) {
        // Create user from metadata if not found in DB
        const rawLifeosId = userMetadata?.lifeos_id || email.split('@')[0];
        const lifeosId = cleanLifeOSId(rawLifeosId) || `user_${Date.now()}`;
        const displayName = userMetadata?.display_name || email.split('@')[0];

        user = await prisma.user.create({
          data: {
            email,
            supabaseId: supabaseId || `sb_${Date.now()}`,
            lifeosId,
            displayName,
            theme: userMetadata?.theme || 'dark',
            locale: userMetadata?.locale || 'tr',
            backgroundType: userMetadata?.background_type || 'default',
            backgroundValue: userMetadata?.background_value || null,
            homescreen: {
              create: {
                pages: [
                  {
                    page: 0,
                    items: [
                      { moduleId: 'ai', position: 0, size: 'small' },
                      { moduleId: 'chat', position: 1, size: 'small' },
                      { moduleId: 'family', position: 2, size: 'small' },
                      { moduleId: 'finance', position: 3, size: 'small' },
                      { moduleId: 'medai', position: 4, size: 'small' },
                      { moduleId: 'energy', position: 5, size: 'small' },
                      { moduleId: 'camera', position: 6, size: 'small' },
                      { moduleId: 'smart-home', position: 7, size: 'small' }
                    ]
                  }
                ],
                dockItems: [
                  { moduleId: 'ai', position: 0 },
                  { moduleId: 'files', position: 1 },
                  { moduleId: 'cloud', position: 2 }
                ]
              },
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          supabaseId: user.supabaseId,
          lifeosId: user.lifeosId,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          locale: user.locale,
          theme: user.theme,
          backgroundType: user.backgroundType,
          backgroundValue: user.backgroundValue,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    } catch (dbError) {
      console.warn('Sync DB fallback:', dbError);
      const rawLifeosId = userMetadata?.lifeos_id || email.split('@')[0];
      const lifeosId = cleanLifeOSId(rawLifeosId);
      const displayName = userMetadata?.display_name || email.split('@')[0];

      return NextResponse.json({
        success: true,
        user: {
          id: `local_${Date.now()}`,
          supabaseId: supabaseId || `sb_${Date.now()}`,
          lifeosId,
          email,
          displayName,
          avatarUrl: null,
          bio: null,
          locale: 'tr',
          theme: 'dark',
          backgroundType: 'default',
          backgroundValue: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Senkronizasyon hatası.' },
      { status: 500 }
    );
  }
}
