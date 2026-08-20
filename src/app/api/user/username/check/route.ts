import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId, isValidLifeOSId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username');
    const currentUserId = searchParams.get('currentUserId');

    if (!rawUsername) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı belirtilmedi.' },
        { status: 400 }
      );
    }

    const lifeosId = cleanLifeOSId(rawUsername);

    if (!isValidLifeOSId(lifeosId)) {
      return NextResponse.json({
        available: false,
        error: 'Kullanıcı adı 3-20 karakter uzunluğunda olmalı, sadece küçük harf, rakam ve alt çizgi içerebilir.',
      });
    }

    // Reserved system names
    const reservedNames = ['admin', 'root', 'lifeos', 'system', 'api', 'app', 'settings', 'support', 'help'];
    if (reservedNames.includes(lifeosId)) {
      return NextResponse.json({
        available: false,
        error: 'Bu kullanıcı adı sistem tarafından ayrılmıştır.',
      });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { lifeosId },
        select: { id: true },
      });

      if (existingUser && (!currentUserId || existingUser.id !== currentUserId)) {
        return NextResponse.json({
          available: false,
          error: `@${lifeosId} kullanıcı adı zaten kullanımda.`,
        });
      }

      return NextResponse.json({
        available: true,
        lifeosId,
      });
    } catch (dbError) {
      // If DB is offline or mock environment, return valid
      console.warn('DB check bypassed:', dbError);
      return NextResponse.json({
        available: true,
        lifeosId,
      });
    }
  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { available: false, error: 'Kullanıcı adı kontrol edilemedi.' },
      { status: 500 }
    );
  }
}
