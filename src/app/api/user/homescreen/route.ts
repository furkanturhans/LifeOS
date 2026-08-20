import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: sbUser.id },
      include: { homescreen: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    let layout = user.homescreen;
    if (!layout) {
      // Create default layout
      layout = await prisma.homescreen.create({
        data: {
          userId: user.id,
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
        }
      });
    }

    return NextResponse.json({
      success: true,
      layout: {
        pages: layout.pages,
        dockItems: layout.dockItems
      }
    });
  } catch (error: any) {
    console.error('Fetch homescreen layout error:', error);
    return NextResponse.json(
      { error: error.message || 'Homescreen düzeni yüklenemedi.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { layout } = body;

    if (!layout || !layout.pages || !layout.dockItems) {
      return NextResponse.json(
        { error: 'Geçersiz homescreen düzeni verisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: sbUser.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const updatedHomescreen = await prisma.homescreen.upsert({
      where: { userId: user.id },
      update: {
        pages: layout.pages,
        dockItems: layout.dockItems
      },
      create: {
        userId: user.id,
        pages: layout.pages,
        dockItems: layout.dockItems
      }
    });

    return NextResponse.json({
      success: true,
      layout: {
        pages: updatedHomescreen.pages,
        dockItems: updatedHomescreen.dockItems
      }
    });
  } catch (error: any) {
    console.error('Save homescreen layout error:', error);
    return NextResponse.json(
      { error: error.message || 'Homescreen düzeni kaydedilemedi.' },
      { status: 500 }
    );
  }
}
