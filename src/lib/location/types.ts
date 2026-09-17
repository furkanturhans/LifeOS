import type {
  LocationPlace,
  LocationAutocompleteRequest,
  LocationCoordinates,
  RouteCalculationResult,
  LocationProviderId,
} from '@/types/location';

export interface ILocationProvider {
  readonly id: LocationProviderId;
  readonly isConfigured: boolean;
  
  autocomplete(request: LocationAutocompleteRequest): Promise<LocationPlace[]>;
  calculateRoute(
    origin: LocationCoordinates,
    destination: LocationCoordinates,
    profile?: 'car' | 'truck' | 'bike'
  ): Promise<RouteCalculationResult>;
}
