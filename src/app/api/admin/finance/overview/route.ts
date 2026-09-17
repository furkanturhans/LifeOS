import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { FinanceRegistry } from '@/lib/admin/FinanceRegistry';
import type { TimeFilterOption } from '@/types/finance';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const { searchParams } = new URL(request.url);
  const timeFilter = (searchParams.get('timeFilter') as TimeFilterOption) || 'this_month';

  const metrics = FinanceRegistry.getOverviewMetrics(timeFilter);
  const subscriptionMetrics = FinanceRegistry.getSubscriptionMetrics();
  const digitalProducts = FinanceRegistry.getDigitalProductsSummary();

  return NextResponse.json({
    success: true,
    metrics,
    subscriptionMetrics,
    digitalProducts,
  });
}
