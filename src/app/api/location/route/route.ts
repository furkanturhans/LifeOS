import { NextRequest, NextResponse } from 'next/server';
import { locationService } from '@/lib/location/LocationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, profile } = body;

    if (
      !origin ||
      typeof origin.lat !== 'number' ||
      typeof origin.lng !== 'number' ||
      !destination ||
      typeof destination.lat !== 'number' ||
      typeof destination.lng !== 'number'
    ) {
      return NextResponse.json(
        {
          isConfigured: locationService.isConfigured,
          message: 'Geçersiz koordinat bilgisi.',
        },
        { status: 400 }
      );
    }

    const response = await locationService.calculateRoute(origin, destination, profile);
    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        isConfigured: locationService.isConfigured,
        message: 'Rota hesaplama servisi geçici olarak yanıt veremiyor.',
      },
      { status: 200 }
    );
  }
}
