import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { surplusAction, inverterStatus, userId, userName } = body;

    const result = SmartHomeEngine.controlSolarInverter({
      surplusAction,
      inverterStatus,
      userId: userId || 'user_local',
      userName: userName || 'Ev Yöneticisi',
    });

    return NextResponse.json({
      success: true,
      message: 'Solar inverter ayarları güncellendi.',
      solar: result.solarSystem,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Solar ayarları kaydedilemedi.' },
      { status: 500 }
    );
  }
}
