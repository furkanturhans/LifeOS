import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';
import type { SmartHomeRole } from '@/types/smarthome';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cameraId,
      privacyMode,
      nightVision,
      ptzDirection,
      userId,
      userName,
      userRole,
    } = body;

    const result = SmartHomeEngine.controlCamera({
      cameraId,
      privacyMode,
      nightVision,
      ptzDirection,
      userId: userId || 'user_local',
      userName: userName || 'Ev Yöneticisi',
      userRole: (userRole as SmartHomeRole) || 'home_owner',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kamera ayarı güncellendi.',
      camera: result.camera,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Kamera ayarı uygulanamadı.' },
      { status: 500 }
    );
  }
}
