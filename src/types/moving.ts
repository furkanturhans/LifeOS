export type MovingStatus =
  | 'draft'
  | 'waiting_bids'
  | 'bid_submitted'
  | 'match_confirmed'
  | 'completed'
  | 'cancelled';

export const MOVING_STATUS_LABELS: Record<MovingStatus, { tr: string; color: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' }> = {
  draft: { tr: 'Taslak', color: 'text-muted-foreground', badgeVariant: 'outline' },
  waiting_bids: { tr: 'Teklif Bekleniyor', color: 'text-amber-500', badgeVariant: 'warning' },
  bid_submitted: { tr: 'Teklif Verildi', color: 'text-blue-500', badgeVariant: 'secondary' },
  match_confirmed: { tr: 'Eşleşme Onaylandı', color: 'text-emerald-500', badgeVariant: 'success' },
  completed: { tr: 'Tamamlandı', color: 'text-primary', badgeVariant: 'default' },
  cancelled: { tr: 'İptal', color: 'text-destructive', badgeVariant: 'destructive' },
};

export type MovingCategoryType =
  | 'home_to_home'
  | 'partial_item'
  | 'office'
  | 'pallet_freight'
  | 'intercity';

export const MOVING_CATEGORY_DEFINITIONS: {
  id: MovingCategoryType;
  labelTr: string;
  iconEmoji: string;
  descriptionTr: string;
}[] = [
  {
    id: 'home_to_home',
    labelTr: 'Evden Eve',
    iconEmoji: '🏡',
    descriptionTr: 'Komple daire ve ev eşyası taşımacılığı',
  },
  {
    id: 'partial_item',
    labelTr: 'Parça Eşya',
    iconEmoji: '📦',
    descriptionTr: 'Birkaç mobilya, beyaz eşya veya koli',
  },
  {
    id: 'office',
    labelTr: 'Ofis / İşyeri',
    iconEmoji: '🏢',
    descriptionTr: 'Büro mobilyası, arşiv ve elektronik eşya',
  },
  {
    id: 'pallet_freight',
    labelTr: 'Paletli / Yük',
    iconEmoji: '🏗️',
    descriptionTr: 'Ağır yük, paletli ürün ve ticari sevkiyat',
  },
  {
    id: 'intercity',
    labelTr: 'Şehirlerarası Özel',
    iconEmoji: '🛣️',
    descriptionTr: 'İller arası parsiyel veya komple taşıma',
  },
];

export interface MovingRequest {
  id: string; // örn: TR-4821
  creatorId: string; // anonim istemci kimliği
  fromCity: string;
  toCity: string;
  movingType: MovingCategoryType;
  loadDescription: string;
  requestedDate: string;
  notes?: string;
  status: MovingStatus;
  createdAt: string;
  acceptedBidId?: string;
}

export interface MovingBid {
  id: string; // örn: BID-9041
  requestId: string;
  providerId: string; // teklif veren nakliyeci anonim kimliği
  providerAnonymousTitle: string; // örn: "Taşıyıcı #NK-314"
  providerVehicleInfo: string; // örn: "Kapalı Kasa Kamyonet / Asansörlü"
  price: number;
  currency: string;
  bidNote: string;
  creditFee: number; // örn: 80 TL (yapılandırılabilir)
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface MovingPlatformConfig {
  bidCreditFee: number; // Default 80 TL, yapılandırılabilir
  currency: string;
  allowDirectCalling: boolean; // false
  allowDirectMessaging: boolean; // false
}
