import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { FinanceRegistry } from '@/lib/admin/FinanceRegistry';
import type { FinanceSourceModule, TransactionStatus, TimeFilterOption } from '@/types/finance';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const { searchParams } = new URL(request.url);
  const sourceModule = (searchParams.get('sourceModule') as FinanceSourceModule) || undefined;
  const status = (searchParams.get('status') as TransactionStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const timeFilter = (searchParams.get('timeFilter') as TimeFilterOption) || undefined;

  const transactions = FinanceRegistry.listTransactions({
    sourceModule,
    status,
    search,
    timeFilter,
  });

  return NextResponse.json({
    success: true,
    transactions,
    totalCount: transactions.length,
  });
}
