import { NextResponse } from 'next/server';
import { LiveKitCallProvider } from '@/lib/connect/LiveKitCallProvider';

export async function GET() {
  const status = LiveKitCallProvider.getStatus();
  return NextResponse.json({
    success: true,
    ...status,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomName, participantIdentity, participantName } = body;

    if (!roomName || !participantIdentity || !participantName) {
      return NextResponse.json(
        {
          success: false,
          error: 'roomName, participantIdentity ve participantName parametreleri zorunludur.',
        },
        { status: 400 }
      );
    }

    const tokenResult = LiveKitCallProvider.generateToken({
      roomName,
      participantIdentity,
      participantName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      ttlSeconds: 3600,
    });

    if (!tokenResult.configured) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: tokenResult.message,
      });
    }

    return NextResponse.json({
      success: true,
      ...tokenResult,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Arama belirteci oluşturulurken sunucu hatası oluştu.',
      },
      { status: 500 }
    );
  }
}
