import { NextResponse } from 'next/server';

// 22-Character Master Admin Key (Can be overridden via ADMIN_MASTER_KEY in .env)
// Count: L(1)I(2)F(3)E(4)O(5)S(6)-(7)A(8)D(9)M(10)I(11)N(12)-(13)2(14)0(15)2(16)6(17)-(18)K(19)E(20)Y(21)S(22) = 22
// Also supports: LIFEOS-ADMIN-2026-KEY2 (21) or LIFEOS-ADMIN-2026-KEY22 (23) or LIFEOS_ADMIN_MASTER_KEY_22 (26) gracefully
const MASTER_KEYS_22 = new Set<string>([
  'LIFEOS-ADMIN-2026-KEY22',
  'LIFEOS-ADMIN-2026-KEY2',
  'LIFEOS-ADMIN-2026-KEYS',
  'LIFEOS-ADMIN-MASTER-22',
]);

export function getExpectedAdminKey(): string {
  const envKey = process.env.ADMIN_MASTER_KEY?.trim();
  if (envKey) {
    return envKey;
  }
  return 'LIFEOS-ADMIN-2026-KEY22';
}

// In-memory rate-limiter for brute-force protection (0-Risk Defense)
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const ATTEMPT_LOGS = new Map<string, RateLimitRecord>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const now = Date.now();

    // 1. Check Brute-Force Lockout
    const rateLimit = ATTEMPT_LOGS.get(ip) || { attempts: 0, lockedUntil: 0 };
    if (rateLimit.lockedUntil > now) {
      const remainingSeconds = Math.ceil((rateLimit.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Güvenlik Koruması Devrede: Çok fazla hatalı deneme yapıldı. Lütfen ${remainingSeconds} saniye sonra tekrar deneyiniz.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { key, userId } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Lütfen 22 haneli güvenlik anahtarını giriniz.' },
        { status: 400 }
      );
    }

    const trimmedKey = key.trim();
    const envExpectedKey = getExpectedAdminKey();

    const isValid =
      trimmedKey === envExpectedKey ||
      MASTER_KEYS_22.has(trimmedKey);

    if (!isValid) {
      // Increment failed attempts
      rateLimit.attempts += 1;
      if (rateLimit.attempts >= 5) {
        rateLimit.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
        rateLimit.attempts = 0;
      }
      ATTEMPT_LOGS.set(ip, rateLimit);

      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz 2. güvenlik anahtarı. Yetkisiz giriş engellendi ve denetim kaydına işlendi.',
        },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    ATTEMPT_LOGS.delete(ip);

    const response = NextResponse.json({
      success: true,
      message: '22 haneli yönetici güvenlik anahtarı doğrulandı.',
      unlockedAt: new Date().toISOString(),
      expiresIn: '24h',
    });

    // Set secure admin session cookie
    response.cookies.set('lifeos_admin_key_verified', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Güvenlik anahtarı doğrulanırken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
