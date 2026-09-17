import type { ILocationProvider } from './types';
import type {
  LocationPlace,
  LocationAutocompleteRequest,
  LocationCoordinates,
  RouteCalculationResult,
  LocationProviderId,
} from '@/types/location';

export class GraphHopperLocationProvider implements ILocationProvider {
  readonly id: LocationProviderId = 'graphhopper';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GRAPHHOPPER_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async autocomplete(request: LocationAutocompleteRequest): Promise<LocationPlace[]> {
    if (!this.isConfigured || !request.text || request.text.trim().length < 3) {
      return [];
    }

    try {
      const limit = request.limit || 5;
      const url = `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(
        request.text.trim()
      )}&locale=tr&limit=${limit}&key=${this.apiKey}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!data.hits || !Array.isArray(data.hits)) {
        return [];
      }

      return data.hits.map((hit: any, index: number) => {
        const point = hit.point || {};
        const name = hit.name || hit.street || 'Konum';
        const city = hit.city || hit.state || '';
        const district = hit.district || '';

        return {
          id: hit.osm_id ? `osm-${hit.osm_id}` : `gh-${index}-${Date.now()}`,
          name,
          formattedAddress: [name, district, city, hit.country].filter(Boolean).join(', '),
          city,
          district,
          country: hit.country || 'Türkiye',
          countryCode: hit.countrycode || 'tr',
          coordinates: point.lat && point.lng ? { lat: point.lat, lng: point.lng } : undefined,
          provider: 'graphhopper',
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
      const vehicle = profile === 'truck' ? 'small_truck' : profile === 'bike' ? 'bike' : 'car';
      const url = `https://graphhopper.com/api/1/route?point=${origin.lat},${origin.lng}&point=${destination.lat},${destination.lng}&vehicle=${vehicle}&locale=tr&key=${this.apiKey}`;

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
      const path = data.paths?.[0];
      if (!path) {
        return {
          isConfigured: true,
          message: 'Güzergah bulunamadı.',
        };
      }

      const distanceMeters = Math.round(path.distance || 0);
      const durationSeconds = Math.round((path.time || 0) / 1000);

      return {
        isConfigured: true,
        provider: 'graphhopper',
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
