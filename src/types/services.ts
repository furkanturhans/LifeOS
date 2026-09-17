export type ServiceModuleKey = 'taxi' | 'travel' | 'moving' | 'craftsman';

export interface ServiceModuleDefinition {
  id: ServiceModuleKey;
  titleTr: string;
  titleEn: string;
  taglineTr: string;
  taglineEn: string;
  iconEmoji: string;
  iconName: string;
  gradient: string;
  accentBg: string;
  accentColor: string;
  isActive: boolean;
  href?: string;
}

export const SERVICE_MODULES: ServiceModuleDefinition[] = [
  {
    id: 'taxi',
    titleTr: 'Taksi',
    titleEn: 'Taxi',
    taglineTr: 'Sabit tarifeli, güvenli ve hızlı şehir içi taksi çağırma',
    taglineEn: 'Fixed-fare, reliable and fast city taxi dispatch',
    iconEmoji: '🚕',
    iconName: 'Car',
    gradient: 'from-amber-400/15 via-amber-400/5 to-transparent',
    accentBg: 'bg-amber-500/10 text-amber-500',
    accentColor: '#f59e0b',
    isActive: true,
    href: '/services/taxi',
  },
  {
    id: 'travel',
    titleTr: 'Seyahat',
    titleEn: 'Travel',
    taglineTr: 'Şehirlerarası otobüs, bilet ve konforlu seyahat planlama',
    taglineEn: 'Intercity bus, ticketing, and comfortable trip planning',
    iconEmoji: '🚌',
    iconName: 'Bus',
    gradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    accentBg: 'bg-blue-500/10 text-blue-500',
    accentColor: '#3b82f6',
    isActive: true,
    href: '/services/travel',
  },
  {
    id: 'moving',
    titleTr: 'Nakliye',
    titleEn: 'Moving & Logistics',
    taglineTr: 'Evden eve, parça eşya ve şehirlerarası güvenli taşımacılık',
    taglineEn: 'Home-to-home, partial item, and intercity reliable moving',
    iconEmoji: '🚚',
    iconName: 'Truck',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    accentBg: 'bg-emerald-500/10 text-emerald-500',
    accentColor: '#10b981',
    isActive: true,
    href: '/services/moving',
  },
  {
    id: 'craftsman',
    titleTr: 'Usta',
    titleEn: 'Handyman & Craftsman',
    taglineTr: 'Elektrik, tesisat, boya ve ev bakımında güvenilir ustalar',
    taglineEn: 'Reliable handymen for electrical, plumbing, painting and repairs',
    iconEmoji: '🛠️',
    iconName: 'Wrench',
    gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    accentBg: 'bg-purple-500/10 text-purple-500',
    accentColor: '#8b5cf6',
    isActive: true,
    href: '/services/craftsman',
  },
];

export type UserRoleInService = 'customer' | 'provider';

export type MovingCategory = 'home_to_home' | 'partial_item' | 'office' | 'intercity';

export interface TransportRequest {
  id: string;
  category: MovingCategory;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  roomInfo?: string;
  floorFrom?: number;
  floorTo?: number;
  hasElevatorFrom?: boolean;
  hasElevatorTo?: boolean;
  notes?: string;
  createdAt: string;
  status: 'open' | 'bidding' | 'accepted' | 'completed' | 'cancelled';
  bidsCount: number;
}

export interface TransportBid {
  id: string;
  requestId: string;
  providerName: string;
  providerRating: number;
  vehicleType: string;
  offeredPrice: number;
  currency: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}
