export type TravelProductCategory = 'bus' | 'flight' | 'hotel' | 'car_rental';

export type TravelPartnerStatus =
  | 'partner_guest' // Başvuru yapmamış normal kullanıcı
  | 'partner_applicant' // Başvurusu incelenen firma yetkilisi
  | 'partner_verified' // Doğrulanmış ve yetkili firma yetkilisi
  | 'partner_suspended'; // Askıya alınmış firma hesabı

export type PartnerAuthorizedRole =
  | 'company_owner' // Firma Sahibi / Kurucu
  | 'operations_manager' // Operasyon / Sefer / Tesis Müdürü
  | 'agency_rep' // Yetkili Acente / Satış Temsilcisi
  | 'dispatcher'; // Filo / İstasyon Sorumlusu

// ---------------------------------------------------------------------------
// 1. OTOBÜS İŞ ORTAĞI & TASLAKLARI
// ---------------------------------------------------------------------------
export interface TravelCompanyProfile {
  id: string;
  userId: string;
  companyName: string; // Firma Ticari Unvanı / Markası
  authorizedPersonName: string; // Yetkili Ad Soyad
  authorizedRole: PartnerAuthorizedRole; // Yetkili Rolü
  serviceType: 'intercity_bus';
  d2LicenseNumber?: string; // D2 / B2 Ulaştırma Bakanlığı Belge No
  taxNumber?: string; // Vergi Numarası / Dairesi
  contactEmail?: string;
  status: TravelPartnerStatus;
  appliedAt: string;
  verifiedAt?: string;
}

export interface TravelDraftVehicle {
  id: string;
  companyId: string;
  vehicleCode: string; // Örn: 34-LIF-01 / Travego-01
  plateNumber: string; // Plaka
  vehicleType: '2+1_comfort' | '2+2_standard' | 'vip_minibus';
  seatCapacity: number; // Koltuk Kapasitesi (Örn: 38, 46)
  features: string[]; // Wi-Fi, 220V Priz, TV Ekran, İkram
  createdAt: string;
}

export interface TravelDraftRoute {
  id: string;
  companyId: string;
  originCity: string; // Kalkış İli (Örn: İstanbul)
  originTerminal: string; // Kalkış Otogarı (Örn: Esenler Otogarı)
  destinationCity: string; // Varış İli (Örn: Ankara)
  destinationTerminal: string; // Varış Otogarı (Örn: AŞTİ)
  intermediateStops?: string[]; // Ara Duraklar (Örn: Kocaeli, Bolu)
  estimatedDurationHours: number; // Tahmini Varış Süresi (Saat)
  createdAt: string;
}

export interface TravelDraftTrip {
  id: string;
  companyId: string;
  routeId: string;
  vehicleId: string;
  departureDateTime: string; // Kalkış Tarih ve Saat
  baseTicketPrice: number; // Taban Bilet Fiyatı (TL)
  currency: string;
  isDraft: boolean; // Taslak Durumu (Yayında Değil)
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TravelSeatPlanTemplate {
  id: string;
  companyId: string;
  templateName: string;
  seatLayout: '2+1' | '2+2';
  totalSeats: number;
}

// ---------------------------------------------------------------------------
// 2. UÇAK / HAVAYOLU İŞ ORTAĞI & TASLAKLARI
// ---------------------------------------------------------------------------
export interface FlightPartnerProfile {
  id: string;
  userId: string;
  companyName: string; // Havayolu Şirketi / Markası (Örn: LifeAir Havacılık)
  authorizedPersonName: string;
  authorizedRole: PartnerAuthorizedRole;
  serviceType: 'airline';
  shgmLicenseNumber?: string; // SHGM Ruhsat No / IATA Kodu
  iataCode?: string; // Örn: LF
  icaoCode?: string; // Örn: LFA
  taxNumber?: string;
  contactEmail?: string;
  status: TravelPartnerStatus;
  appliedAt: string;
  verifiedAt?: string;
}

export interface FlightDraftAircraft {
  id: string;
  companyId: string;
  tailNumber: string; // Kuyruk Tescil Kodu (Örn: TC-LFA)
  model: string; // Model (Örn: Airbus A320neo, Boeing 737-800)
  totalSeats: number;
  economySeats: number;
  businessSeats: number;
  features: string[]; // Wi-Fi, USB Güç, Özel İkram
  createdAt: string;
}

export interface FlightDraftAirport {
  id: string;
  name: string; // Havalimanı Adı (Örn: İstanbul Havalimanı)
  city: string; // Şehir (Örn: İstanbul)
  iataCode: string; // IST
  country: string; // Türkiye
  createdAt: string;
}

export interface FlightDraftRoute {
  id: string;
  companyId: string;
  originAirportCode: string; // Örn: IST
  destinationAirportCode: string; // Örn: ESB
  flightDurationMinutes: number; // Örn: 65 dk
  createdAt: string;
}

export interface FlightDraftFlight {
  id: string;
  companyId: string;
  flightNumber: string; // Örn: LF-204
  routeId: string;
  aircraftId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  economyBasePrice: number;
  businessBasePrice: number;
  currency: string;
  isDraft: boolean;
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FlightSeatPlanTemplate {
  id: string;
  companyId: string;
  templateName: string;
  layout: '3+3' | '2+2' | '2+4+2';
  totalSeats: number;
}

// ---------------------------------------------------------------------------
// 3. OTEL & KONAKLAMA İŞ ORTAĞI & TASLAKLARI
// ---------------------------------------------------------------------------
export interface HotelPartnerProfile {
  id: string;
  userId: string;
  companyName: string; // Otel / Tesis Ticari Ünvanı
  propertyName: string; // Tesis Marka Adı (Örn: Grand Life Resort & Spa)
  authorizedPersonName: string;
  authorizedRole: PartnerAuthorizedRole;
  serviceType: 'hotel';
  tourismLicenseNumber?: string; // Turizm İşletme Belgesi / Belediye Ruhsatı
  propertyType: 'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension';
  starRating: number; // 1-5
  city: string;
  district: string;
  taxNumber?: string;
  contactEmail?: string;
  status: TravelPartnerStatus;
  appliedAt: string;
  verifiedAt?: string;
}

export interface HotelDraftProperty {
  id: string;
  companyId: string;
  name: string;
  propertyType: 'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension';
  starRating: number;
  city: string;
  district: string;
  address: string;
  amenities: string[]; // Açık Havuz, Spa, Wi-Fi, Ücretsiz Otopark, Kahvaltı Dahil
  checkInTime: string; // 14:00
  checkOutTime: string; // 12:00
  createdAt: string;
}

export interface HotelDraftRoomType {
  id: string;
  companyId: string;
  propertyId: string;
  title: string; // Örn: Standart Çift Kişilik Oda / Deluxe Suit
  bedConfig: string; // Örn: 1 Çift Kişilik Yatak
  maxGuests: number;
  sizeSqMeters: number;
  amenities: string[]; // Balkon, Deniz Manzarası, Klima, Minibar
  createdAt: string;
}

export interface HotelDraftRoom {
  id: string;
  companyId: string;
  propertyId: string;
  roomTypeId: string;
  roomNumber: string; // Örn: 301
  floor: number;
  createdAt: string;
}

export interface HotelDraftRatePlan {
  id: string;
  companyId: string;
  propertyId: string;
  roomTypeId: string;
  planName: string; // Örn: Sadece Oda / Oda Kahvaltı / Her Şey Dahil
  mealBoard: 'room_only' | 'bed_and_breakfast' | 'half_board' | 'all_inclusive';
  basePricePerNight: number;
  currency: string;
  cancellationPolicy: 'free_cancellation' | 'non_refundable';
  createdAt: string;
}

export interface HotelDraftAvailability {
  id: string;
  companyId: string;
  propertyId: string;
  roomTypeId: string;
  date: string;
  availableRoomsCount: number;
  price: number;
}

// ---------------------------------------------------------------------------
// 4. ARAÇ KİRALAMA İŞ ORTAĞI & TASLAKLARI
// ---------------------------------------------------------------------------
export interface CarRentalPartnerProfile {
  id: string;
  userId: string;
  companyName: string; // Rent-a-Car Firma Adı (Örn: LifeCar Rent a Car)
  authorizedPersonName: string;
  authorizedRole: PartnerAuthorizedRole;
  serviceType: 'car_rental';
  kabisNumber?: string; // KABİS Ruhsat & Yetki No
  taxNumber?: string;
  fleetSize?: number;
  contactEmail?: string;
  status: TravelPartnerStatus;
  appliedAt: string;
  verifiedAt?: string;
}

export interface CarRentalDraftBranch {
  id: string;
  companyId: string;
  name: string; // Örn: İstanbul Havalimanı Ofisi / Kadıköy Şube
  city: string;
  district: string;
  address: string;
  phone: string;
  isAirportBranch: boolean;
  createdAt: string;
}

export interface CarRentalDraftVehicleClass {
  id: string;
  companyId: string;
  classCode: 'economy' | 'compact' | 'suv' | 'luxury' | 'van';
  className: string; // Örn: Ekonomi Sınıf (Renault Clio veya benzeri)
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  seatCapacity: number;
  minDriverAge: number; // 21
  minDrivingLicenseYears: number; // 2
  createdAt: string;
}

export interface CarRentalDraftVehicle {
  id: string;
  companyId: string;
  branchId: string;
  classId: string;
  brand: string; // Renault
  model: string; // Clio 1.0 TCe
  year: number; // 2024
  plateNumber: string; // 34-RENT-102
  mileage: number;
  status: 'available' | 'maintenance' | 'rented';
  createdAt: string;
}

export interface CarRentalDraftRatePlan {
  id: string;
  companyId: string;
  classId: string;
  planName: string; // Örn: Standart Günlük Kiralama
  dailyRate: number; // 1450 TL
  weeklyDiscountPercent: number; // 10%
  depositAmount: number; // 3000 TL
  mileageLimitPerDay: number; // 300 km
  currency: string;
  createdAt: string;
}

export interface CarRentalDraftAvailability {
  id: string;
  companyId: string;
  branchId: string;
  classId: string;
  date: string;
  availableUnitsCount: number;
}

// ---------------------------------------------------------------------------
// LABELS & CONSTANTS
// ---------------------------------------------------------------------------
export const PARTNER_ROLE_LABELS: Record<PartnerAuthorizedRole, string> = {
  company_owner: 'Firma Sahibi / Kurucu Ortak',
  operations_manager: 'Operasyon & Tesis Müdürü',
  agency_rep: 'Yetkili Satış / Acente Temsilcisi',
  dispatcher: 'Filo & İstasyon Sorumlusu',
};

export const PRODUCT_LABELS: Record<TravelProductCategory, { labelTr: string; emoji: string; descTr: string }> = {
  bus: {
    labelTr: 'Şehirlerarası Otobüs',
    emoji: '🚌',
    descTr: 'D2/B2 yetki belgeli şehirlerarası otobüs firmaları',
  },
  flight: {
    labelTr: 'Havayolu & Uçak',
    emoji: '✈️',
    descTr: 'SHGM lisanslı tarifeli ve charter havayolu şirketleri',
  },
  hotel: {
    labelTr: 'Otel & Konaklama',
    emoji: '🏨',
    descTr: 'Turizm işletme veya belediye ruhsatlı otel ve resort tesisleri',
  },
  car_rental: {
    labelTr: 'Araç Kiralama (Rent a Car)',
    emoji: '🚗',
    descTr: 'KABİS kayıtlı kurumsal araç kiralama firmaları',
  },
};

export const VEHICLE_TYPE_LABELS: Record<string, { labelTr: string; emoji: string }> = {
  '2+1_comfort': { labelTr: '2+1 Rahat Hat (Geniş Koltuk)', emoji: '💺' },
  '2+2_standard': { labelTr: '2+2 Standart Otobüs', emoji: '🚌' },
  vip_minibus: { labelTr: 'VIP Minibüs / Transfer', emoji: '🚐' },
};


