import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId } from '@/lib/utils';
import { getLocalUser, saveLocalUser } from '@/lib/localDb';

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

      const userData = {
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
      };

      // Mirror successful sync to local store for offline fallback
      if (user.supabaseId) {
        saveLocalUser(user.supabaseId, userData);
      }

      const response = NextResponse.json({ success: true, user: userData });
      response.cookies.set('lifeos_session', user.supabaseId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        httpOnly: false,
      });
      return response;
    } catch (dbError) {
      console.warn('Sync DB fallback:', dbError);

      const finalSupabaseId = supabaseId || `sb_${Date.now()}`;

      // Restore existing local user data — do NOT overwrite with defaults
      const existingLocal = getLocalUser(finalSupabaseId);

      const rawLifeosId = userMetadata?.lifeos_id || email.split('@')[0];
      const lifeosId = cleanLifeOSId(rawLifeosId);
      const displayName = userMetadata?.display_name || email.split('@')[0];

      // Merge: keep existing values where present, only fill defaults for new fields
      const fallbackUser = {
        id: existingLocal?.id || `local_${Date.now()}`,
        supabaseId: finalSupabaseId,
        lifeosId: existingLocal?.lifeosId || lifeosId,
        email: existingLocal?.email || email,
        displayName: existingLocal?.displayName || displayName,
        avatarUrl: existingLocal?.avatarUrl || null,
        bio: existingLocal?.bio || null,
        locale: existingLocal?.locale || 'tr',
        theme: existingLocal?.theme || 'dark',
        backgroundType: existingLocal?.backgroundType || 'default',
        backgroundValue: existingLocal?.backgroundValue || null,
        createdAt: existingLocal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist merged data to local store
      saveLocalUser(finalSupabaseId, fallbackUser);

      const response = NextResponse.json({ success: true, user: fallbackUser });
      response.cookies.set('lifeos_session', finalSupabaseId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        httpOnly: false,
      });
      return response;
    }
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Senkronizasyon hatası.' },
      { status: 500 }
    );
  }
}
