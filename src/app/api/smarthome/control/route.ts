import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';
import type { SmartHomeRole } from '@/types/smarthome';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      deviceId,
      command,
      value,
      userId = 'user_local',
      userName,
      userRole = 'home_owner' as SmartHomeRole,
      securityPin,
    } = body;

    if (!deviceId || !command) {
      return NextResponse.json(
        { success: false, message: 'Cihaz kimliği ve komut parametresi zorunludur.' },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.sendDeviceCommand({
      deviceId,
      command,
      value,
      userId,
      userName,
      userRole,
      securityPin,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 403 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Cihaz kontrol komutu işlenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
