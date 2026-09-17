import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';
import type { SmartHomeRole } from '@/types/smarthome';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sceneId,
      userId = 'user_local',
      userName,
      userRole = 'home_owner' as SmartHomeRole,
    } = body;

    if (!sceneId) {
      return NextResponse.json(
        { success: false, message: 'Sahne kimliği zorunludur.' },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.activateScene({
      sceneId,
      userId,
      userName,
      userRole,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sahne çalıştırılırken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
