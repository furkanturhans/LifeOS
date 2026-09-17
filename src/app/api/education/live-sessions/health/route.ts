import { NextResponse } from 'next/server';
import { bbbProvider } from '@/lib/education/BigBlueButtonProvider';

export async function GET() {
  try {
    const health = await bbbProvider.healthCheck();
    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('BigBlueButton healthcheck route error:', error);
    return NextResponse.json(
      {
        success: false,
        health: {
          isConfigured: false,
          provider: 'bigbluebutton',
          isReachable: false,
          message: 'Sağlık kontrolü sırasında bir hata oluştu.',
        },
      },
      { status: 500 }
    );
  }
}
