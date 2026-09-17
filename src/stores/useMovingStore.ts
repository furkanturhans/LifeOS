import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MovingRequest,
  MovingBid,
  MovingPlatformConfig,
  MovingCategoryType,
  MovingStatus,
} from '@/types/moving';
import { ProviderPolicy } from '@/lib/services/providerPolicy';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';

interface MovingStoreState {
  currentRole: 'customer' | 'provider';
  currentUserId: string;
  config: MovingPlatformConfig;
  myRequests: MovingRequest[];
  openMarketplaceRequests: MovingRequest[];
  bids: MovingBid[];

  // Actions
  setCurrentRole: (role: 'customer' | 'provider') => void;
  setBidCreditFee: (fee: number) => void;
  createMovingRequest: (data: {
    fromCity: string;
    toCity: string;
    movingType: MovingCategoryType;
    loadDescription: string;
    requestedDate: string;
    notes?: string;
  }) => MovingRequest;
  submitBid: (data: {
    requestId: string;
    price: number;
    bidNote: string;
    providerVehicleInfo?: string;
  }) => MovingBid;
  acceptBid: (requestId: string, bidId: string) => void;
  cancelRequest: (requestId: string) => void;
  getBidsForMyRequest: (requestId: string) => MovingBid[];
  getMySubmittedBids: () => MovingBid[];
  getExistingBidForRequest: (requestId: string) => MovingBid | undefined;
  getMarketplaceRequestsForProvider: () => MovingRequest[];
}

// Generate collision-safe unique ID
function generateUniqueId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${ts}-${rand}`;
}

const CURRENT_USER_ID = 'current_user_me';

const SEED_REQUESTS: MovingRequest[] = [
  {
    id: 'TR-seed-01',
    creatorId: 'anon_user_99',
    fromCity: 'İstanbul - Kadıköy',
    toCity: 'İzmir - Karşıyaka',
    movingType: 'home_to_home',
    loadDescription: '2+1 Salon ve Yatak Odası, 3 adet beyaz eşya, 12 adet standart koli',
    requestedDate: '2026-09-28',
    notes: 'Yükleme tarafında asansör var, varış yeri 2. kat merdivenli.',
    status: 'waiting_bids',
    createdAt: '2026-09-16T04:00:00.000Z',
  },
  {
    id: 'TR-seed-02',
    creatorId: 'anon_user_88',
    fromCity: 'Ankara - Çankaya',
    toCity: 'Bursa - Nilüfer',
    movingType: 'partial_item',
    loadDescription: '1 adet L Koltuk Takımı, 1 adet Çamaşır Makinesi ve 4 koli',
    requestedDate: '2026-10-02',
    notes: 'Sadece hafta sonu teslimat uygundur.',
    status: 'waiting_bids',
    createdAt: '2026-09-15T18:00:00.000Z',
  },
];

// Helper to deduplicate items by ID
function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    if (item && item.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export const useMovingStore = create<MovingStoreState>()(
  persist(
    (set, get) => ({
      currentRole: 'customer',
      currentUserId: CURRENT_USER_ID,
      config: {
        bidCreditFee: 80, // Yapılandırılabilir 80 TL teklif kredisi
        currency: 'TL',
        allowDirectCalling: false,
        allowDirectMessaging: false,
      },
      myRequests: [],
      openMarketplaceRequests: SEED_REQUESTS,
      bids: [],

      setCurrentRole: (currentRole) => set({ currentRole }),

      setBidCreditFee: (fee) =>
        set((state) => ({
          config: { ...state.config, bidCreditFee: fee },
        })),

      createMovingRequest: (data) => {
        const newReq: MovingRequest = {
          id: generateUniqueId('TR'),
          creatorId: CURRENT_USER_ID,
          fromCity: data.fromCity.trim(),
          toCity: data.toCity.trim(),
          movingType: data.movingType,
          loadDescription: data.loadDescription.trim(),
          requestedDate: data.requestedDate || 'Belirtilmedi',
          notes: data.notes?.trim() || '',
          status: 'waiting_bids',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          myRequests: deduplicateById([newReq, ...state.myRequests]),
          openMarketplaceRequests: deduplicateById([newReq, ...state.openMarketplaceRequests]),
        }));

        return newReq;
      },

      submitBid: (data) => {
        const { config, openMarketplaceRequests, myRequests } = get();
        const movingProfile = useProviderAuthStore.getState().getProfile('moving');

        // 1. Find the target request to check permissions and self-bid rule
        const allRequests = [...myRequests, ...openMarketplaceRequests];
        const targetReq = allRequests.find((r) => r.id === data.requestId);
        const requestCreatorId = targetReq?.creatorId || '';

        // 2. Central Policy Authorization Check with serviceType: 'moving'
        const authCheck = ProviderPolicy.canSubmitBid({
          serviceType: 'moving',
          profile: movingProfile,
          requestCreatorId,
          currentUserId: CURRENT_USER_ID,
        });

        if (!authCheck.allowed) {
          throw new Error(authCheck.reason || 'Teklif verme yetkiniz bulunmamaktadır.');
        }

        const providerId = 'current_provider_me';
        const existingBids = get().bids;

        const existingIndex = existingBids.findIndex(
          (b) => b.requestId === data.requestId && b.providerId === providerId
        );

        let updatedBid: MovingBid;

        if (existingIndex !== -1) {
          // Update existing bid to prevent duplicates
          updatedBid = {
            ...existingBids[existingIndex],
            price: data.price,
            bidNote: data.bidNote.trim(),
            providerVehicleInfo: data.providerVehicleInfo || existingBids[existingIndex].providerVehicleInfo,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          const newBids = [...existingBids];
          newBids[existingIndex] = updatedBid;

          set({ bids: deduplicateById(newBids) });
        } else {
          // Create new unique bid
          updatedBid = {
            id: generateUniqueId('BID'),
            requestId: data.requestId,
            providerId,
            providerAnonymousTitle: `Nakliyeci #${generateUniqueId('NK')}`,
            providerVehicleInfo: data.providerVehicleInfo || 'Kapalı Kasa Kamyonet / Asansörlü',
            price: data.price,
            currency: config.currency,
            bidNote: data.bidNote.trim(),
            creditFee: config.bidCreditFee,
            createdAt: new Date().toISOString(),
            status: 'pending',
          };

          set((state) => ({
            bids: deduplicateById([updatedBid, ...state.bids]),
          }));
        }

        return updatedBid;
      },

      acceptBid: (requestId, bidId) => {
        set((state) => ({
          myRequests: state.myRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'match_confirmed', acceptedBidId: bidId }
              : r
          ),
          openMarketplaceRequests: state.openMarketplaceRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'match_confirmed', acceptedBidId: bidId }
              : r
          ),
          bids: state.bids.map((b) =>
            b.id === bidId
              ? { ...b, status: 'accepted' }
              : b.requestId === requestId
              ? { ...b, status: 'rejected' }
              : b
          ),
        }));
      },

      cancelRequest: (requestId) => {
        set((state) => ({
          myRequests: state.myRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'cancelled' } : r
          ),
          openMarketplaceRequests: state.openMarketplaceRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'cancelled' } : r
          ),
        }));
      },

      getBidsForMyRequest: (requestId) => {
        const allBids = get().bids;
        const matching = allBids.filter((b) => b.requestId === requestId);
        return deduplicateById(matching);
      },

      getMySubmittedBids: () => {
        const allBids = get().bids;
        const matching = allBids.filter((b) => b.providerId === 'current_provider_me');
        return deduplicateById(matching);
      },

      getExistingBidForRequest: (requestId) => {
        const allBids = get().bids;
        return allBids.find(
          (b) => b.requestId === requestId && b.providerId === 'current_provider_me'
        );
      },

      // Hizmet Veren Pazar Yeri Filtrelemesi: Kendi oluşturduğu talepler veri seviyesinde filtrelenir!
      getMarketplaceRequestsForProvider: () => {
        const { openMarketplaceRequests } = get();
        const filtered = ProviderPolicy.filterMarketplaceRequests(
          openMarketplaceRequests,
          CURRENT_USER_ID
        );
        return deduplicateById(filtered);
      },
    }),
    {
      name: 'lifeos-moving-logistics',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.myRequests = deduplicateById(state.myRequests || []);
          state.openMarketplaceRequests = deduplicateById(
            state.openMarketplaceRequests && state.openMarketplaceRequests.length > 0
              ? state.openMarketplaceRequests
              : SEED_REQUESTS
          );
          state.bids = deduplicateById(state.bids || []);
        }
      },
    }
  )
);
