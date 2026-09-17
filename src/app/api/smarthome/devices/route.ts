import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, userId } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, message: 'Cihaz kimliği zorunludur.' }, { status: 400 });
    }

    const ok = SmartHomeEngine.removeDevice(deviceId, userId || 'user_local');
    return NextResponse.json({
      success: ok,
      message: ok ? 'Cihaz başarıyla kaldırıldı.' : 'Cihaz bulunamadı.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Cihaz kaldırılamadı.' }, { status: 500 });
  }
}
