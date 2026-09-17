import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { FinanceRegistry } from '@/lib/admin/FinanceRegistry';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';
import type { PayoutStatus } from '@/types/finance';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const { searchParams } = new URL(request.url);
  const recipientType = searchParams.get('recipientType') as 'instructor' | 'provider' | null;

  const payouts = FinanceRegistry.listPayouts(recipientType || undefined);

  return NextResponse.json({
    success: true,
    payouts,
  });
}

export async function PATCH(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const { payoutId, newStatus, paymentReference, adminNotes } = body;

    if (!payoutId || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'Hakediş ID ve yeni durum zorunludur.' },
        { status: 400 }
      );
    }

    const result = FinanceRegistry.updatePayoutStatus({
      payoutId,
      newStatus: newStatus as PayoutStatus,
      adminId: auth.context.adminId,
      adminDisplayName: auth.context.displayName,
      paymentReference,
      adminNotes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Log this action to AuditLog
    AdminRegistry.logAudit({
      adminId: auth.context.adminId,
      adminDisplayName: auth.context.displayName,
      action: 'setting_updated',
      targetType: 'system',
      targetId: payoutId,
      targetTitle: `Hakediş Durumu Güncellendi: ${newStatus}`,
      notes: adminNotes || paymentReference ? `Ref: ${paymentReference || '-'}, Not: ${adminNotes || '-'}` : undefined,
    });

    return NextResponse.json({
      success: true,
      payout: result.payout,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek parametreleri.' },
      { status: 400 }
    );
  }
}
