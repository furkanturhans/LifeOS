import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';
import type { PaymentMethodType } from '@/types/payment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intentId, paymentMethod, idempotencyKey, userId = 'user_local' } = body;

    if (!intentId || !paymentMethod || !idempotencyKey) {
      return NextResponse.json(
        { success: false, error: 'Ödeme için intentId, paymentMethod ve idempotencyKey zorunludur.' },
        { status: 400 }
      );
    }

    const result = await PaymentEngine.processCheckout({
      intentId,
      paymentMethod: paymentMethod as PaymentMethodType,
      idempotencyKey,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ödeme işlenirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
