export type CraftsmanCategory =
  | 'electrical' // Elektrik
  | 'plumbing' // Su Tesisatı
  | 'painting' // Boya & Badana
  | 'furniture' // Mobilya & Montaj
  | 'ac_heating' // Klima & Kombi
  | 'cleaning' // Temizlik
  | 'other'; // Diğer

export type CraftsmanStatus =
  | 'waiting_bids' // Teklif Bekleniyor
  | 'match_confirmed' // Eşleşme Onaylandı
  | 'completed' // Tamamlandı
  | 'cancelled'; // İptal Edildi

export interface CraftsmanRequest {
  id: string;
  creatorId: string;
  category: CraftsmanCategory;
  problemDescription: string;
  location: string; // İl / Bölge
  preferredDateTime: string; // Uygun Tarih ve Saat
  notes?: string;
  status: CraftsmanStatus;
  acceptedBidId?: string;
  createdAt: string;
}

export interface CraftsmanBid {
  id: string;
  requestId: string;
  craftsmanId: string;
  craftsmanAnonymousTitle: string; // Örn: Usta #US-842
  price: number;
  currency: string;
  bidNote: string;
  estimatedDuration: string; // Örn: 2-3 Saat, 1 Gün
  creditFee: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CraftsmanPlatformConfig {
  bidCreditFee: number;
  currency: string;
  allowDirectCalling: boolean;
  allowDirectMessaging: boolean;
}

export const CRAFTSMAN_CATEGORIES_CONFIG: {
  id: CraftsmanCategory;
  labelTr: string;
  iconEmoji: string;
  descTr: string;
}[] = [
  {
    id: 'electrical',
    labelTr: 'Elektrik & Aydınlatma',
    iconEmoji: '⚡',
    descTr: 'Priz, avize, sigorta panosu ve elektrik tesisatı arızaları',
  },
  {
    id: 'plumbing',
    labelTr: 'Su Tesisatı & Gider',
    iconEmoji: '🚰',
    descTr: 'Musluk, batarya, su sızıntısı ve tıkanıklık açma',
  },
  {
    id: 'painting',
    labelTr: 'Boya, Badana & Alçı',
    iconEmoji: '🎨',
    descTr: 'Oda/ev boyama, duvar tamiratı ve alçıpan işleri',
  },
  {
    id: 'furniture',
    labelTr: 'Mobilya & Montaj',
    iconEmoji: '🪑',
    descTr: 'Dolap, masa, yatak kurulumu ve ahşap tamiratı',
  },
  {
    id: 'ac_heating',
    labelTr: 'Klima, Kombi & Isıtma',
    iconEmoji: '❄️',
    descTr: 'Klima montajı/gaz dolumu, kombi bakım ve petek temizliği',
  },
  {
    id: 'cleaning',
    labelTr: 'Temizlik & İlaçlama',
    iconEmoji: '🧹',
    descTr: 'İnşaat sonrası temizlik, koltuk yıkama ve dezenfeksiyon',
  },
  {
    id: 'other',
    labelTr: 'Diğer Ustalık Hizmetleri',
    iconEmoji: '🛠️',
    descTr: 'Kapı/kilit değişimi, pencere sineklik ve genel ev onarımı',
  },
];

export const CRAFTSMAN_STATUS_LABELS: Record<
  CraftsmanStatus,
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
    tr: 'İş Tamamlandı',
    en: 'Completed',
    badgeVariant: 'secondary',
  },
  cancelled: {
    tr: 'İptal Edildi',
    en: 'Cancelled',
    badgeVariant: 'destructive',
  },
};
