import { NextResponse } from 'next/server';
import { AdminRegistry } from './AdminRegistry';

export interface AdminAuthContext {
  isAdmin: boolean;
  role: 'admin' | 'super_admin' | null;
  adminId: string;
  displayName: string;
}

/**
 * Server route helper to authenticate and assert admin permissions
 */
export function assertAdmin(request: Request): {
  authorized: boolean;
  context?: AdminAuthContext;
  response?: NextResponse;
} {
  const url = new URL(request.url);
  const userId =
    request.headers.get('x-user-id') ||
    url.searchParams.get('userId') ||
    'user_local';

  const userEmail =
    request.headers.get('x-user-email') ||
    url.searchParams.get('email');

  const result = AdminRegistry.verifyAdmin({
    userId,
    email: userEmail,
  });

  if (!result.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Bu alana erişim yetkiniz bulunmuyor. Yalnızca yetkili yöneticiler işlem yapabilir.',
          code: 'UNAUTHORIZED_ADMIN_ACCESS',
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    context: result,
  };
}
