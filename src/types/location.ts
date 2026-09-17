export type LocationProviderId = 'geoapify' | 'graphhopper' | 'custom';

export type LocationCategory = 'city' | 'airport' | 'station' | 'address' | 'district' | 'poi';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationPlace {
  id: string; // Sağlayıcı veya benzersiz kimlik
  name: string; // Örn: "Kadıköy", "İstanbul Havalimanı"
  formattedAddress: string; // Örn: "Kadıköy, İstanbul, Türkiye"
  city: string; // Örn: "İstanbul"
  district?: string; // Örn: "Kadıköy"
  country?: string; // Örn: "Türkiye"
  countryCode?: string; // Örn: "tr"
  coordinates?: LocationCoordinates; // Enlem & Boylam (opsiyonel)
  category?: LocationCategory;
  provider: LocationProviderId;
}

export interface LocationAutocompleteRequest {
  text: string;
  countryCode?: string; // Varsayılan: 'tr'
  limit?: number; // Varsayılan: 5
}

export interface LocationAutocompleteResponse {
  isConfigured: boolean; // Sunucu tarafında API anahtarı tanımlı mı?
  provider?: LocationProviderId;
  message?: string;
  results: LocationPlace[];
}

export interface RouteCalculationRequest {
  origin: LocationCoordinates;
  destination: LocationCoordinates;
  profile?: 'car' | 'truck' | 'bike';
}

export interface RouteCalculationResult {
  isConfigured: boolean;
  distanceMeters?: number;
  distanceFormatted?: string; // Örn: "452 km"
  durationSeconds?: number;
  durationFormatted?: string; // Örn: "4s 35dk"
  provider?: LocationProviderId;
  message?: string;
}
