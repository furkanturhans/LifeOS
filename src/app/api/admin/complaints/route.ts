import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const complaints = AdminRegistry.listComplaints();

  return NextResponse.json({
    success: true,
    complaints,
  });
}

export async function POST(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const { complaintId, action, resolutionNotes } = body;

    if (!complaintId || !['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler.' },
        { status: 400 }
      );
    }

    const result = AdminRegistry.resolveComplaint({
      complaintId,
      action,
      resolutionNotes: resolutionNotes || 'Şikayet yönetici tarafından incelenip kapatıldı.',
      adminId: auth.context.adminId,
      adminDisplayName: auth.context.displayName,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      complaint: result.complaint,
      message: 'Şikayet başarıyla sonuçlandırıldı.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Şikayet işlenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
