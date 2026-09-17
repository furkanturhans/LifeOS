import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  return NextResponse.json({
    success: true,
    isAdmin: true,
    role: auth.context.role,
    adminId: auth.context.adminId,
    displayName: auth.context.displayName,
  });
}
