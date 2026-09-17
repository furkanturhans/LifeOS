import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const users = AdminRegistry.listUsers();

  return NextResponse.json({
    success: true,
    users,
  });
}

export async function POST(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const { userId, status, reason } = body;

    if (!userId || !['active', 'restricted', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler.' },
        { status: 400 }
      );
    }

    const result = AdminRegistry.updateUserStatus({
      userId,
      status,
      adminId: auth.context.adminId,
      adminDisplayName: auth.context.displayName,
      reason: reason || 'Yönetici hesap güncellemesi',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'Kullanıcı durumu başarıyla güncellendi.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Kullanıcı durumu işlenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
