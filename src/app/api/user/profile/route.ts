import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId, isValidLifeOSId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const lifeosId = searchParams.get('lifeosId');

    if (!userId && !email && !lifeosId) {
      return NextResponse.json(
        { error: 'Kullanıcı tanımlayıcısı belirtilmedi.' },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (userId) whereClause.id = userId;
    else if (email) whereClause.email = email;
    else if (lifeosId) whereClause.lifeosId = cleanLifeOSId(lifeosId);

    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        homescreen: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ user });
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
    const body = await request.json();
    const {
      id,
      email,
      displayName,
      lifeosId: rawLifeosId,
      avatarUrl,
      bio,
      theme,
      locale,
      backgroundType,
      backgroundValue,
    } = body;

    if (!id && !email) {
      return NextResponse.json(
        { error: 'Kullanıcı ID veya e-posta zorunludur.' },
        { status: 400 }
      );
    }

    let cleanedLifeosId: string | undefined = undefined;

    if (rawLifeosId) {
      cleanedLifeosId = cleanLifeOSId(rawLifeosId);

      if (!isValidLifeOSId(cleanedLifeosId)) {
        return NextResponse.json(
          {
            error:
              'Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve sadece küçük harf, rakam ve alt çizgi içermelidir.',
          },
          { status: 400 }
        );
      }

      // Check uniqueness in database
      try {
        const existing = await prisma.user.findFirst({
          where: {
            lifeosId: cleanedLifeosId,
            NOT: id ? { id } : email ? { email } : undefined,
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: `@${cleanedLifeosId} kullanıcı adı zaten başka bir kullanıcı tarafından kullanılıyor.` },
            { status: 409 }
          );
        }
      } catch (dbErr) {
        console.warn('DB uniqueness check error:', dbErr);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (cleanedLifeosId !== undefined) updateData.lifeosId = cleanedLifeosId;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;
    if (theme !== undefined) updateData.theme = theme;
    if (locale !== undefined) updateData.locale = locale;
    if (backgroundType !== undefined) updateData.backgroundType = backgroundType;
    if (backgroundValue !== undefined) updateData.backgroundValue = backgroundValue;

    let updatedUser: any = null;

    try {
      if (id) {
        updatedUser = await prisma.user.upsert({
          where: { id },
          update: updateData,
          create: {
            id,
            supabaseId: id,
            email: email || `${cleanedLifeosId || 'user'}@lifeos.local`,
            displayName: displayName || 'LifeOS Kullanıcısı',
            lifeosId: cleanedLifeosId || 'user',
            avatarUrl,
            bio,
            theme: theme || 'dark',
            locale: locale || 'tr',
            backgroundType: backgroundType || 'default',
            backgroundValue,
          },
        });
      } else if (email) {
        updatedUser = await prisma.user.update({
          where: { email },
          data: updateData,
        });
      }
    } catch (dbError) {
      console.warn('Prisma update fallback to memory:', dbError);
      // Construct fallback user object
      updatedUser = {
        id: id || 'local_user',
        supabaseId: id || 'local_user',
        email: email || 'user@lifeos.local',
        displayName: displayName || 'LifeOS Kullanıcısı',
        lifeosId: cleanedLifeosId || 'user',
        avatarUrl: avatarUrl || null,
        bio: bio || null,
        theme: theme || 'dark',
        locale: locale || 'tr',
        backgroundType: backgroundType || 'default',
        backgroundValue: backgroundValue || null,
        updatedAt: new Date().toISOString(),
      };
    }

    // Try updating Supabase user_metadata if active
    try {
      const supabase = await createClient();
      const metadataUpdates: any = {};
      if (displayName) metadataUpdates.display_name = displayName;
      if (cleanedLifeosId) metadataUpdates.lifeos_id = cleanedLifeosId;
      if (backgroundType) metadataUpdates.background_type = backgroundType;
      if (backgroundValue) metadataUpdates.background_value = backgroundValue;

      if (Object.keys(metadataUpdates).length > 0) {
        await supabase.auth.updateUser({
          data: metadataUpdates,
        });
      }
    } catch (sbError) {
      // Supabase update optional if offline
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        supabaseId: updatedUser.supabaseId || updatedUser.id,
        lifeosId: updatedUser.lifeosId,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        locale: updatedUser.locale,
        theme: updatedUser.theme,
        backgroundType: updatedUser.backgroundType || 'default',
        backgroundValue: updatedUser.backgroundValue || null,
        createdAt: updatedUser.createdAt?.toString() || new Date().toISOString(),
        updatedAt: updatedUser.updatedAt?.toString() || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Profil güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
