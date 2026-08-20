import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId, isValidLifeOSId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { getLocalUser, saveLocalUser, isLocalUsernameUnique } from '@/lib/localDb';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    let verifiedSupabaseId = sbUser?.id;
    if (!verifiedSupabaseId) {
      const cookieStore = await cookies();
      verifiedSupabaseId = cookieStore.get('lifeos_session')?.value;
    }

    let dbUser = null;

    // Prioritize authenticated session ID to retrieve the profile securely
    if (verifiedSupabaseId) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { supabaseId: verifiedSupabaseId },
          include: { homescreen: true },
        });
      } catch (dbErr) {
        console.warn('DB offline (GET profile), using local fallback:', dbErr);
        const localUser = getLocalUser(verifiedSupabaseId);
        if (localUser) {
          return NextResponse.json({ user: localUser });
        }
        return NextResponse.json(
          { error: 'Veritabanı bağlantısı yok. Lütfen tekrar deneyin.' },
          { status: 503 }
        );
      }
    }

    // Fallback/Legacy query parameters (if no session or for public queries)
    if (!dbUser) {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const lifeosId = searchParams.get('lifeosId');

      if (!userId && !email && !lifeosId) {
        // Try local fallback if we have a session ID
        if (verifiedSupabaseId) {
          const localUser = getLocalUser(verifiedSupabaseId);
          if (localUser) return NextResponse.json({ user: localUser });
        }
        return NextResponse.json(
          { error: 'Kullanıcı tanımlayıcısı belirtilmedi.' },
          { status: 400 }
        );
      }

      const whereClause: any = {};
      if (userId) whereClause.id = userId;
      else if (email) whereClause.email = email;
      else if (lifeosId) whereClause.lifeosId = cleanLifeOSId(lifeosId);

      try {
        dbUser = await prisma.user.findFirst({
          where: whereClause,
          include: { homescreen: true },
        });
      } catch (dbErr) {
        console.warn('DB offline (GET profile fallback query):', dbErr);
      }
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        supabaseId: dbUser.supabaseId,
        lifeosId: dbUser.lifeosId,
        email: dbUser.email,
        displayName: dbUser.displayName,
        avatarUrl: dbUser.avatarUrl,
        bio: dbUser.bio,
        locale: dbUser.locale,
        theme: dbUser.theme,
        backgroundType: dbUser.backgroundType,
        backgroundValue: dbUser.backgroundValue,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
        homescreen: dbUser.homescreen,
      }
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı profili alınamadı.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    let verifiedSupabaseId = sbUser?.id;
    if (!verifiedSupabaseId) {
      const cookieStore = await cookies();
      verifiedSupabaseId = cookieStore.get('lifeos_session')?.value;
    }

    // Strict authentication check
    if (!verifiedSupabaseId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      lifeosId: rawLifeosId,
      avatarUrl,
      bio,
      theme,
      locale,
      backgroundType,
      backgroundValue,
      email: bodyEmail,
    } = body;

    let cleanedLifeosId: string | undefined = undefined;

    if (rawLifeosId) {
      cleanedLifeosId = cleanLifeOSId(rawLifeosId);

      if (!isValidLifeOSId(cleanedLifeosId)) {
        return NextResponse.json(
          {
            error:
              'Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve sadece küçük harf, rakam ve alt çizgi içerebilir.',
          },
          { status: 400 }
        );
      }
    }

    // Build changes payload
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (cleanedLifeosId !== undefined) updateData.lifeosId = cleanedLifeosId;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (theme !== undefined) updateData.theme = theme;
    if (locale !== undefined) updateData.locale = locale;
    if (backgroundType !== undefined) updateData.backgroundType = backgroundType;
    if (backgroundValue !== undefined) updateData.backgroundValue = backgroundValue;

    try {
      // Securely find the user record from PostgreSQL by verified Supabase UUID
      let dbUser = await prisma.user.findUnique({
        where: { supabaseId: verifiedSupabaseId }
      });

      // Fallback: If registration was offline, the user record might not exist in Prisma yet.
      if (!dbUser) {
        const email = sbUser?.email || bodyEmail || '';
        const fallbackLifeosId = cleanLifeOSId(rawLifeosId || email.split('@')[0]) || `user_${Date.now()}`;
        const fallbackDisplayName = displayName || sbUser?.user_metadata?.display_name || email.split('@')[0] || 'LifeOS Kullanıcısı';

        dbUser = await prisma.user.create({
          data: {
            supabaseId: verifiedSupabaseId,
            email,
            displayName: fallbackDisplayName,
            lifeosId: fallbackLifeosId,
            theme: theme || 'dark',
            locale: locale || 'tr',
            backgroundType: backgroundType || 'default',
            backgroundValue: backgroundValue || null,
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
          }
        });
      }

      if (cleanedLifeosId) {
        // Case-insensitive uniqueness check
        const existing = await prisma.user.findFirst({
          where: {
            lifeosId: { equals: cleanedLifeosId, mode: 'insensitive' },
            NOT: { id: dbUser.id },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: `@${cleanedLifeosId} kullanıcı adı zaten başka bir kullanıcı tarafından kullanılıyor.` },
            { status: 409 }
          );
        }
      }

      // Persist profile changes securely using verified CUID primary key
      const updatedUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
      });

      // Mirror the DB update to local fallback store to survive offline sessions
      saveLocalUser(verifiedSupabaseId, {
        id: updatedUser.id,
        supabaseId: updatedUser.supabaseId,
        lifeosId: updatedUser.lifeosId,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        locale: updatedUser.locale,
        theme: updatedUser.theme,
        backgroundType: updatedUser.backgroundType || 'default',
        backgroundValue: updatedUser.backgroundValue || null,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      });

      // Try updating Supabase user_metadata to maintain auth service synchronization
      try {
        const metadataUpdates: any = {};
        if (displayName) metadataUpdates.display_name = displayName;
        if (cleanedLifeosId) metadataUpdates.lifeos_id = cleanedLifeosId;
        if (backgroundType) metadataUpdates.background_type = backgroundType;
        if (backgroundValue) metadataUpdates.background_value = backgroundValue;

        if (Object.keys(metadataUpdates).length > 0 && sbUser) {
          await supabase.auth.updateUser({ data: metadataUpdates });
        }
      } catch (sbError) {
        console.warn('Supabase metadata sync failed:', sbError);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser.id,
          supabaseId: updatedUser.supabaseId,
          lifeosId: updatedUser.lifeosId,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          locale: updatedUser.locale,
          theme: updatedUser.theme,
          backgroundType: updatedUser.backgroundType || 'default',
          backgroundValue: updatedUser.backgroundValue || null,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      });
    } catch (dbError: any) {
      // DB is offline — apply changes only to local fallback store
      console.warn('DB offline (PATCH profile), using local fallback:', dbError);

      // Case-insensitive uniqueness check in local store
      if (cleanedLifeosId && !isLocalUsernameUnique(cleanedLifeosId, verifiedSupabaseId)) {
        return NextResponse.json(
          { error: `@${cleanedLifeosId} kullanıcı adı zaten kullanılıyor.` },
          { status: 409 }
        );
      }

      // Get existing local user to preserve all previous fields
      const existingLocal = getLocalUser(verifiedSupabaseId) || {
        id: `local_${Date.now()}`,
        supabaseId: verifiedSupabaseId,
        email: sbUser?.email || bodyEmail || '',
        lifeosId: cleanLifeOSId(sbUser?.email?.split('@')[0] || '') || 'user',
        displayName:
          sbUser?.user_metadata?.display_name ||
          sbUser?.email?.split('@')[0] ||
          'LifeOS Kullanıcısı',
        locale: 'tr',
        theme: 'dark',
        backgroundType: 'default',
        backgroundValue: null,
      };

      const merged = { ...existingLocal, ...updateData };
      const savedLocal = saveLocalUser(verifiedSupabaseId, merged);

      return NextResponse.json({
        success: true,
        user: {
          ...savedLocal,
          createdAt: savedLocal.createdAt || new Date().toISOString(),
          updatedAt: savedLocal.updatedAt || new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Profil güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
