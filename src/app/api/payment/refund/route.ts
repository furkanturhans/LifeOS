import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, reason, adminId } = body;

    if (!transactionId || !reason) {
      return NextResponse.json(
        { success: false, error: 'İşlem kimliği ve iade nedeni zorunludur.' },
        { status: 400 }
      );
    }

    const result = PaymentEngine.refundTransaction({
      transactionId,
      reason,
      adminId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'İade işlemi işlenemedi.' },
      { status: 500 }
    );
  }
}
