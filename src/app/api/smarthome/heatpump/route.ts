import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      mode,
      targetTempC,
      hotWaterTankTargetTempC,
      silentMode,
      boostMode,
      solarSyncEnabled,
      userId,
      userName,
    } = body;

    const result = SmartHomeEngine.controlHeatPump({
      mode,
      targetTempC,
      hotWaterTankTargetTempC,
      silentMode,
      boostMode,
      solarSyncEnabled,
      userId: userId || 'user_local',
      userName: userName || 'Ev Yöneticisi',
    });

    return NextResponse.json({
      success: true,
      message: 'Isı pompası ayarları uygulandı.',
      heatPump: result.heatPump,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Isı pompası ayarları kaydedilemedi.' },
      { status: 500 }
    );
  }
}
