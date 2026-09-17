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
  const format = searchParams.get('format') || 'json';
  const timeFilter = (searchParams.get('timeFilter') as TimeFilterOption) || 'this_month';

  if (format === 'csv') {
    const csvContent = FinanceRegistry.generateExportCsv(timeFilter);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lifeos-finans-rapor-${timeFilter}-${Date.now()}.csv"`,
      },
    });
  }

  const metrics = FinanceRegistry.getOverviewMetrics(timeFilter);
  const transactions = FinanceRegistry.listTransactions({ timeFilter });

  return NextResponse.json({
    success: true,
    timeFilter,
    metrics,
    transactions,
  });
}
