import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_local';

  const wallet = PaymentEngine.getWallet(userId);
  const ledger = PaymentEngine.getLedger(userId);
  const refundRequests = PaymentEngine.getRefundRequests(userId);
  const creditRate = PaymentEngine.getCreditRate();
  const serviceRules = PaymentEngine.getServiceCreditRules();
  const parental = PaymentEngine.getParentalControl(userId);

  return NextResponse.json({
    success: true,
    wallet,
    ledger,
    refundRequests,
    creditRate,
    serviceRules,
    parental,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      userId = 'user_local',
      creditCount,
      paymentMethod,
      idempotencyKey,
      description,
      reason,
      originalPaymentMethod,
      serviceModule,
      referenceId,
      referenceTitle,
      amountKurus,
      credits,
    } = body;

    // 1. Purchase LifeOS Credits
    if (action === 'purchase_credits' || action === 'topup_credits' || action === 'topup_cash') {
      const count = creditCount || credits || Math.floor((amountKurus || 0) / 135) || 100;
      const result = await PaymentEngine.purchaseCredits({
        userId,
        creditCount: count,
        paymentMethod: paymentMethod || 'gateway_card',
        idempotencyKey,
        description,
      });
      return NextResponse.json(result);
    }

    // 2. Request Credit Refund (Unused purchased credits)
    if (action === 'request_refund') {
      if (!creditCount || creditCount <= 0) {
        return NextResponse.json(
          { success: false, error: 'İade edilecek kredi adedi geçerli bir pozitif tam sayı olmalıdır.' },
          { status: 400 }
        );
      }
      const result = PaymentEngine.requestCreditRefund({
        userId,
        creditCount,
        reason: reason || 'Kullanılmamış kredi iadesi talebi',
        originalPaymentMethod,
      });
      return NextResponse.json(result);
    }

    // 3. Service Credit Spend (Taxi, Moving, Craftsman)
    if (action === 'service_spend') {
      if (!serviceModule || !referenceId) {
        return NextResponse.json(
          { success: false, error: 'Hizmet modülü ve referans ID zorunludur.' },
          { status: 400 }
        );
      }
      const result = PaymentEngine.spendCreditsForService({
        providerId: userId,
        serviceModule,
        referenceId,
        referenceTitle: referenceTitle || 'Tamamlanan Hizmet',
        idempotencyKey,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Bilinmeyen cüzdan işlemi.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    );
  }
}
