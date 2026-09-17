import type { ILocationProvider } from './types';
import type {
  LocationPlace,
  LocationAutocompleteRequest,
  LocationCoordinates,
  RouteCalculationResult,
  LocationProviderId,
} from '@/types/location';

export class GeoapifyLocationProvider implements ILocationProvider {
  readonly id: LocationProviderId = 'geoapify';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEOAPIFY_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async autocomplete(request: LocationAutocompleteRequest): Promise<LocationPlace[]> {
    if (!this.isConfigured || !request.text || request.text.trim().length < 3) {
      return [];
    }

    try {
      const country = request.countryCode || 'tr';
      const limit = request.limit || 5;
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        request.text.trim()
      )}&filter=countrycode:${country}&limit=${limit}&lang=tr&apiKey=${this.apiKey}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 }, // 5 min Next.js caching
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!data.features || !Array.isArray(data.features)) {
        return [];
      }

      return data.features.map((feature: any, index: number) => {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates || [];

        const city = props.city || props.county || props.state || '';
        const district = props.district || props.suburb || props.quarter || '';
        const name = props.name || props.street || props.formatted || 'Bilinmeyen Konum';

        return {
          id: props.place_id || `geoapify-${index}-${Date.now()}`,
          name,
          formattedAddress: props.formatted || `${name}, ${city}`,
          city,
          district,
          country: props.country || 'Türkiye',
          countryCode: props.country_code || 'tr',
          coordinates: coords.length >= 2 ? { lng: coords[0], lat: coords[1] } : undefined,
          category: props.category || 'address',
          provider: 'geoapify',
        };
      });
    } catch {
      return [];
    }
  }

  async calculateRoute(
    origin: LocationCoordinates,
    destination: LocationCoordinates,
    profile: 'car' | 'truck' | 'bike' = 'car'
  ): Promise<RouteCalculationResult> {
    if (!this.isConfigured) {
      return {
        isConfigured: false,
        message: 'Konum ve rota servisi yapılandırılmamış.',
      };
    }

    try {
      const mode = profile === 'truck' ? 'truck' : profile === 'bike' ? 'bicycle' : 'drive';
      const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=${mode}&lang=tr&apiKey=${this.apiKey}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        return {
          isConfigured: true,
          message: 'Rota hesaplanamadı.',
        };
      }

      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature || !feature.properties) {
        return {
          isConfigured: true,
          message: 'Uygun güzergah bulunamadı.',
        };
      }

      const distanceMeters = feature.properties.distance || 0;
      const durationSeconds = feature.properties.time || 0;

      return {
        isConfigured: true,
        provider: 'geoapify',
        distanceMeters,
        distanceFormatted: formatDistance(distanceMeters),
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
      };
    } catch {
      return {
        isConfigured: true,
        message: 'Rota servisi bağlantı hatası.',
      };
    }
  }
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km.endsWith('.0') ? km.slice(0, -2) : km} km`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} dk`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}s ${remainingMins}dk` : `${hours} saat`;
}
