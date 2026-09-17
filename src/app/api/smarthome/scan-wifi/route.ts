import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function GET() {
  try {
    const scanResult = await SmartHomeEngine.scanLocalWifiDevices();
    return NextResponse.json(scanResult);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Yerel ağ taraması yapılamadı.' },
      { status: 500 }
    );
  }
}
