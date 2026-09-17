import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = 'user_local',
      sourceModule,
      referenceItemId,
      referenceItemTitle,
      sellerId,
      sellerName,
      grossAmountKurus,
      discountKurus,
      educationCreditsCost,
      idempotencyKey,
      metadata,
    } = body;

    if (!sourceModule || !referenceItemId || !referenceItemTitle) {
      return NextResponse.json(
        { success: false, error: 'Ödeme taslağı için kaynak modül ve referans ürün zorunludur.' },
        { status: 400 }
      );
    }

    const intent = PaymentEngine.createPaymentIntent({
      userId,
      sourceModule,
      referenceItemId,
      referenceItemTitle,
      sellerId,
      sellerName,
      grossAmountKurus: grossAmountKurus || 0,
      discountKurus,
      educationCreditsCost,
      idempotencyKey,
      metadata,
    });

    return NextResponse.json({
      success: true,
      intent,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ödeme taslağı oluşturulamadı.' },
      { status: 400 }
    );
  }
}
