import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const { id: applicationId } = await params;

  try {
    const body = await request.json();
    const { action, reason, needInfoNotes, internalAdminNotes } = body;

    if (!['approve', 'reject', 'under_review', 'need_info', 'suspend'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yönetim işlemi.' },
        { status: 400 }
      );
    }

    const result = AdminRegistry.executeApplicationAction({
      applicationId,
      action,
      adminId: auth.context.adminId,
      adminDisplayName: auth.context.displayName,
      reason,
      needInfoNotes,
      internalAdminNotes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'İşlem gerçekleştirilemedi.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      application: result.application,
      message: `Başvuru durumu başarıyla '${result.application?.status}' olarak güncellendi.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
