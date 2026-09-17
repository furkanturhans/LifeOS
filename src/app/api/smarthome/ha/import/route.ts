import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, token, selectedEntities, userId, userName } = body;

    if (!url || !token || !Array.isArray(selectedEntities) || selectedEntities.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Lütfen içe aktarılacak en az bir cihaz seçiniz.' },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.importSelectedHomeAssistantDevices({
      url,
      token,
      selectedEntities,
      userId: userId || 'user_local',
      userName: userName || 'Ev Sahibi',
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Cihazlar içe aktarılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
