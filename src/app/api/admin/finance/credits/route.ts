import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';
import type { TimeFilterOption } from '@/types/finance';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeFilter = (searchParams.get('timeFilter') as TimeFilterOption) || 'this_month';

  const metrics = PaymentEngine.getCreditOverviewMetrics(timeFilter);
  const refundRequests = PaymentEngine.getRefundRequests();
  const serviceRules = PaymentEngine.getServiceCreditRules();
  const creditRate = PaymentEngine.getCreditRate();

  return NextResponse.json({
    success: true,
    metrics,
    refundRequests,
    serviceRules,
    creditRate,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, requestId, adminId = 'admin_furkan', decision, decisionNote, module, creditsRequired } = body;

    // 1. Review Credit Refund Request (Approve or Reject)
    if (action === 'review_refund') {
      if (!requestId || !decision) {
        return NextResponse.json(
          { success: false, error: 'Talep ID ve onay/ret kararı zorunludur.' },
          { status: 400 }
        );
      }

      const result = PaymentEngine.adminReviewRefund({
        requestId,
        adminId,
        action: decision === 'approve' ? 'approve' : 'reject',
        decisionNote,
      });
      return NextResponse.json(result);
    }

    // 2. Update Service Usage Credit Rule
    if (action === 'update_service_rule') {
      if (!module || !creditsRequired || creditsRequired <= 0) {
        return NextResponse.json(
          { success: false, error: 'Modül ve geçerli kredi adedi zorunludur.' },
          { status: 400 }
        );
      }

      const rule = PaymentEngine.updateServiceCreditRule(module, Number(creditsRequired));
      return NextResponse.json({ success: true, rule });
    }

    return NextResponse.json(
      { success: false, error: 'Bilinmeyen yönetim işlemi.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek.' },
      { status: 400 }
    );
  }
}
