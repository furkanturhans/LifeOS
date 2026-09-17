export type TravelTabCategory = 'bus' | 'flight' | 'hotel' | 'car_rental';
export type TravelProductCategory = 'bus' | 'flight' | 'hotel' | 'car_rental';

export type TravelTripType = 'one_way' | 'round_trip';

// ---------------------------------------------------------------------------
// 1. OTOBÜS (BUS)
// ---------------------------------------------------------------------------
export interface TravelSearchQuery {
  fromLocation: string; // Nereden (Örn: İstanbul - Esenler Otogarı)
  toLocation: string; // Nereye (Örn: Ankara - AŞTİ)
  departureDate: string; // Gidiş Tarihi (YYYY-MM-DD)
  returnDate?: string; // Dönüş Tarihi
  passengerCount: number; // Yolcu Sayısı (1-5)
  tripType: TravelTripType; // Tek Yön / Gidiş-Dönüş
}

export interface TravelTripSchedule {
  id: string;
  companyId: string;
  companyName: string;
  vehicleId: string;
  vehicleType: string;
  routeId: string;
  originTerminal: string;
  destinationTerminal: string;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  basePrice: number;
  currency: string;
  availableSeatsCount: number;
  amenities: string[];
}

// ---------------------------------------------------------------------------
// 2. UÇAK (FLIGHT)
// ---------------------------------------------------------------------------
export type FlightCabinClass = 'economy' | 'business' | 'first';

export interface FlightSearchQuery {
  fromAirport: string; // Örn: IST - İstanbul Havalimanı
  toAirport: string; // Örn: ESB - Ankara Esenboğa
  departureDate: string;
  returnDate?: string;
  passengerCount: number;
  tripType: TravelTripType;
  cabinClass: FlightCabinClass;
}

export interface FlightSchedule {
  id: string;
  airlineId: string;
  airlineName: string;
  flightNumber: string;
  originAirport: string;
  destinationAirport: string;
  departureDateTime: string;
  arrivalDateTime: string;
  durationFormatted: string;
  economyPrice: number;
  businessPrice?: number;
  currency: string;
  aircraftModel: string;
  isDraft: boolean;
}

// ---------------------------------------------------------------------------
// 3. OTEL (HOTEL)
// ---------------------------------------------------------------------------
export interface HotelSearchQuery {
  location: string; // Şehir / Bölge / Otel Adı
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  roomCount: number;
}

export interface HotelListing {
  id: string;
  companyId: string;
  propertyName: string;
  propertyType: 'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension';
  city: string;
  district: string;
  starRating: number;
  basePricePerNight: number;
  currency: string;
  amenities: string[];
  isDraft: boolean;
}

// ---------------------------------------------------------------------------
// 4. ARAÇ KİRALAMA (CAR RENTAL)
// ---------------------------------------------------------------------------
export interface CarRentalSearchQuery {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffDate: string;
  dropoffTime: string;
  differentDropoffLocation: boolean;
  driverAgeCategory: '18-21' | '22-25' | '25+';
}

export interface CarRentalListing {
  id: string;
  companyId: string;
  companyName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleClass: 'economy' | 'compact' | 'suv' | 'luxury' | 'van';
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  dailyRate: number;
  currency: string;
  isDraft: boolean;
}

// ---------------------------------------------------------------------------
// TABS CONFIGURATION (All 4 are active now)
// ---------------------------------------------------------------------------
export const TRAVEL_TABS: {
  id: TravelProductCategory;
  labelTr: string;
  iconEmoji: string;
  isActive: boolean;
  taglineTr: string;
}[] = [
  {
    id: 'bus',
    labelTr: 'Otobüs',
    iconEmoji: '🚌',
    isActive: true,
    taglineTr: 'Şehirlerarası otobüs seferleri ve sefer arama',
  },
  {
    id: 'flight',
    labelTr: 'Uçak',
    iconEmoji: '✈️',
    isActive: true,
    taglineTr: 'Yurt içi ve yurt dışı uçak seferleri',
  },
  {
    id: 'hotel',
    labelTr: 'Otel',
    iconEmoji: '🏨',
    isActive: true,
    taglineTr: 'Otel ve konaklama rezervasyonları',
  },
  {
    id: 'car_rental',
    labelTr: 'Araç Kiralama',
    iconEmoji: '🚗',
    isActive: true,
    taglineTr: 'Güvenilir rent-a-car ve araç kiralama',
  },
];
