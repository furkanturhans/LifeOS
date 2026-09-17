import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Oda adı zorunludur.' }, { status: 400 });
    }

    const room = SmartHomeEngine.createRoom(name, icon || '🏠');
    return NextResponse.json({ success: true, room });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Oda oluşturulamadı.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Oda kimliği zorunludur.' }, { status: 400 });
    }

    const ok = SmartHomeEngine.deleteRoom(roomId);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Oda silinemedi.' }, { status: 500 });
  }
}
