import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId, isValidLifeOSId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName, lifeosId: rawLifeosId, supabaseId } = body;

    if (!email || !displayName || !rawLifeosId) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurunuz.' },
        { status: 400 }
      );
    }

    const lifeosId = cleanLifeOSId(rawLifeosId);

    if (!isValidLifeOSId(lifeosId)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı formatı.' },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { lifeosId }],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return NextResponse.json(
            { error: 'Bu e-posta adresi zaten kullanılıyor.' },
            { status: 409 }
          );
        }
        if (existingUser.lifeosId === lifeosId) {
          return NextResponse.json(
            { error: `@${lifeosId} kullanıcı adı zaten kullanımda.` },
            { status: 409 }
          );
        }
      }

      // Create user and default homescreen
      const newUser = await prisma.user.create({
        data: {
          email,
          displayName,
          lifeosId,
          supabaseId: supabaseId || `sb_${Date.now()}`,
          theme: 'dark',
          locale: 'tr',
          backgroundType: 'default',
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

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          supabaseId: newUser.supabaseId,
          lifeosId: newUser.lifeosId,
          email: newUser.email,
          displayName: newUser.displayName,
          avatarUrl: newUser.avatarUrl,
          bio: newUser.bio,
          locale: newUser.locale,
          theme: newUser.theme,
          backgroundType: newUser.backgroundType,
          backgroundValue: newUser.backgroundValue,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        },
      });
    } catch (dbError) {
      console.warn('DB creation fallback to local:', dbError);
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
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: error.message || 'Kayıt sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
