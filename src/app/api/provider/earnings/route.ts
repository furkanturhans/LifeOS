import { NextResponse } from 'next/server';
import { PaymentEngine } from '@/lib/payment/PaymentEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId') || 'usr-instructor-ahmet';

  const earnings = PaymentEngine.getProviderEarnings(providerId);

  return NextResponse.json({
    success: true,
    earnings,
  });
}
