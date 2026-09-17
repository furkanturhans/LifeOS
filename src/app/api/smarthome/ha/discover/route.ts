import { NextResponse } from 'next/server';
import { SmartHomeEngine } from '@/lib/smarthome/SmartHomeEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, token } = body;

    if (!url || !token) {
      return NextResponse.json(
        { success: false, message: 'Home Assistant adresi ve erişim belirteci gereklidir.' },
        { status: 400 }
      );
    }

    const result = await SmartHomeEngine.testAndFetchHomeAssistantEntities({ url, token });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Home Assistant varlıkları alınamadı.' },
      { status: 500 }
    );
  }
}
