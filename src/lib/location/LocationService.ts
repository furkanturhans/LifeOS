import type { ILocationProvider } from './types';
import { GeoapifyLocationProvider } from './GeoapifyProvider';
import { GraphHopperLocationProvider } from './GraphHopperProvider';
import type {
  LocationPlace,
  LocationAutocompleteRequest,
  LocationAutocompleteResponse,
  LocationCoordinates,
  RouteCalculationResult,
} from '@/types/location';

interface CacheEntry {
  timestamp: number;
  data: LocationPlace[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

class LocationService {
  private geoapifyProvider: GeoapifyLocationProvider;
  private graphhopperProvider: GraphHopperLocationProvider;
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.geoapifyProvider = new GeoapifyLocationProvider();
    this.graphhopperProvider = new GraphHopperLocationProvider();
  }

  private getActiveProvider(): ILocationProvider | null {
    if (this.geoapifyProvider.isConfigured) {
      return this.geoapifyProvider;
    }
    if (this.graphhopperProvider.isConfigured) {
      return this.graphhopperProvider;
    }
    return null;
  }

  get isConfigured(): boolean {
    return this.getActiveProvider() !== null;
  }

  async autocomplete(request: LocationAutocompleteRequest): Promise<LocationAutocompleteResponse> {
    const text = (request.text || '').trim();
    if (text.length < 3) {
      return {
        isConfigured: this.isConfigured,
        results: [],
      };
    }

    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        isConfigured: false,
        message: 'Konum önerileri yakında kullanılabilir olacak.',
        results: [],
      };
    }

    // Check cache
    const cacheKey = `${provider.id}:${request.countryCode || 'tr'}:${text.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        isConfigured: true,
        provider: provider.id,
        results: cached.data,
      };
    }

    try {
      const results = await provider.autocomplete({
        text,
        countryCode: request.countryCode || 'tr',
        limit: request.limit || 5,
      });

      // Save in cache
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: results,
      });

      return {
        isConfigured: true,
        provider: provider.id,
        results,
      };
    } catch {
      return {
        isConfigured: true,
        provider: provider.id,
        results: [],
      };
    }
  }

  async calculateRoute(
    origin: LocationCoordinates,
    destination: LocationCoordinates,
    profile: 'car' | 'truck' | 'bike' = 'car'
  ): Promise<RouteCalculationResult> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        isConfigured: false,
        message: 'Konum ve rota servisi yakında aktif edilecektir.',
      };
    }

    return provider.calculateRoute(origin, destination, profile);
  }
}

export const locationService = new LocationService();
