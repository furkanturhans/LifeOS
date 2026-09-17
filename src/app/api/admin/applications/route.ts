import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/adminAuthGuard';
import { AdminRegistry } from '@/lib/admin/AdminRegistry';
import type { ApplicationType, ApplicationStatus } from '@/types/admin';

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.authorized || !auth.context) {
    return auth.response!;
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') as ApplicationType) || undefined;
  const status = (searchParams.get('status') as ApplicationStatus) || undefined;
  const search = searchParams.get('search') || undefined;

  const applications = AdminRegistry.listApplications({ type, status, search });

  return NextResponse.json({
    success: true,
    applications,
  });
}
