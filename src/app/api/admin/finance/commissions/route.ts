import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { FinanceRegistry } from '@/lib/admin/FinanceRegistry';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const commissionRules = FinanceRegistry.listCommissionRules();

  return NextResponse.json({
    success: true,
    commissionRules,
  });
}
