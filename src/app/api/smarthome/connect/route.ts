import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, url, token, adminId = 'user_local' } = body;

    if (action === 'disconnect') {
      SmartHomeEngine.disconnectBridge(adminId);
      return NextResponse.json({
        success: true,
        message: 'Akıllı ev köprüsü bağlantısı başarıyla kesildi.',
      });
    }

    if (!url || !token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Home Assistant sunucu adresi ve erişim belirteci (Token) zorunludur.',
        },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.connectBridge({
      url,
      token,
      adminId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Akıllı ev merkezine bağlanırken sunucu hatası oluştu.',
      },
      { status: 500 }
    );
  }
}
