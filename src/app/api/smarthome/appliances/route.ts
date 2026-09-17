import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applianceId, command, programName, userId, userName } = body;

    const result = SmartHomeEngine.controlAppliance({
      applianceId,
      command,
      programName,
      userId: userId || 'user_local',
      userName: userName || 'Ev Yöneticisi',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ev aleti komutu iletildi.',
      appliance: result.appliance,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Ev aleti komutu başarısız.' },
      { status: 500 }
    );
  }
}
