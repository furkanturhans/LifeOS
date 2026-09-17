import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const logs = AdminRegistry.listAuditLogs(100);

  return NextResponse.json({
    success: true,
    logs,
  });
}
