import { NextRequest, NextResponse } from 'next/server';
import { locationService } from '@/lib/location/LocationService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text') || searchParams.get('q') || '';
    const countryCode = searchParams.get('country') || 'tr';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const response = await locationService.autocomplete({
      text,
      countryCode,
      limit,
    });

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        isConfigured: locationService.isConfigured,
        message: 'Konum önerileri servisi geçici olarak yanıt veremiyor.',
        results: [],
      },
      { status: 200 }
    );
  }
}
