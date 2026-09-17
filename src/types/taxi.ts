export type TaxiStatus =
  | 'waiting_bids' // Teklif Bekleniyor
  | 'match_confirmed' // Eşleşme Onaylandı
  | 'completed' // Tamamlandı
  | 'cancelled'; // İptal Edildi

export type TaxiVehicleCategory =
  | 'yellow_taxi' // Standart Sarı Taksi
  | 'turquoise_taxi' // Turkuaz Taksi (Konfor / Hibrit)
  | 'black_taxi' // Siyah / VIP Taksi
  | 'large_taxi'; // 8+1 Geniş Aile Taksisi

export interface TaxiRequest {
  id: string;
  creatorId: string;
  pickupLocation: string; // Alınış Bölgesi / İli
  dropoffLocation: string; // Varış Bölgesi / İli
  requestedDateTime: string; // Tarih - Saat
  passengerCount: number; // Yolcu Sayısı (1 - 8)
  notes?: string; // Ek Not (Örn: Bagaj var, evcil hayvan vb.)
  status: TaxiStatus;
  acceptedBidId?: string;
  createdAt: string;
}

export interface TaxiBid {
  id: string;
  requestId: string;
  driverId: string;
  driverAnonymousTitle: string; // Örn: Şoför #TK-842
  vehicleType: string; // Örn: Sarı Taksi - Sedan
  price: number;
  currency: string;
  bidNote: string;
  creditFee: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface TaxiPlatformConfig {
  bidCreditFee: number;
  currency: string;
  allowDirectCalling: boolean;
  allowDirectMessaging: boolean;
}

export const TAXI_STATUS_LABELS: Record<
  TaxiStatus,
  {
    tr: string;
    en: string;
    badgeVariant: 'warning' | 'success' | 'destructive' | 'secondary';
  }
> = {
  waiting_bids: {
    tr: 'Teklif Bekleniyor',
    en: 'Waiting for Bids',
    badgeVariant: 'warning',
  },
  match_confirmed: {
    tr: 'Eşleşme Onaylandı',
    en: 'Match Confirmed',
    badgeVariant: 'success',
  },
  completed: {
    tr: 'Yolculuk Tamamlandı',
    en: 'Completed',
    badgeVariant: 'secondary',
  },
  cancelled: {
    tr: 'İptal Edildi',
    en: 'Cancelled',
    badgeVariant: 'destructive',
  },
};

export const TAXI_VEHICLE_OPTIONS: { id: TaxiVehicleCategory; labelTr: string; emoji: string }[] = [
  { id: 'yellow_taxi', labelTr: 'Sarı Taksi (Standart)', emoji: '🚕' },
  { id: 'turquoise_taxi', labelTr: 'Turkuaz Taksi (Konfor / D-Segment)', emoji: '🚙' },
  { id: 'black_taxi', labelTr: 'Siyah Taksi (VIP / E-Segment)', emoji: '🏎️' },
  { id: 'large_taxi', labelTr: '8+1 Geniş Aile Taksisi (Minivan)', emoji: '🚐' },
];
