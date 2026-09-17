import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupCode, customName, roomName, userId, userName } = body;

    if (!setupCode) {
      return NextResponse.json(
        { success: false, message: 'Matter karekod veya eşleştirme kodu gereklidir.' },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.commissionMatterDevice({
      setupCode,
      customName: customName || 'Matter Cihazı',
      roomName,
      userId: userId || 'user_local',
      userName: userName || 'Ev Sahibi',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Matter eşleştirme işlemi sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
