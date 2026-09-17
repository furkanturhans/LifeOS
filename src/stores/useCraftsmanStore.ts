import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CraftsmanRequest,
  CraftsmanBid,
  CraftsmanPlatformConfig,
  CraftsmanCategory,
} from '@/types/craftsman';
import { ProviderPolicy } from '@/lib/services/providerPolicy';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';

interface CraftsmanStoreState {
  currentRole: 'customer' | 'provider';
  currentUserId: string;
  config: CraftsmanPlatformConfig;
  myRequests: CraftsmanRequest[];
  openMarketplaceRequests: CraftsmanRequest[];
  bids: CraftsmanBid[];

  // Actions
  setCurrentRole: (role: 'customer' | 'provider') => void;
  setBidCreditFee: (fee: number) => void;
  createCraftsmanRequest: (data: {
    category: CraftsmanCategory;
    problemDescription: string;
    location: string;
    preferredDateTime: string;
    notes?: string;
  }) => CraftsmanRequest;
  submitBid: (data: {
    requestId: string;
    price: number;
    bidNote: string;
    estimatedDuration: string;
  }) => CraftsmanBid;
  acceptBid: (requestId: string, bidId: string) => void;
  cancelRequest: (requestId: string) => void;
  getBidsForMyRequest: (requestId: string) => CraftsmanBid[];
  getMySubmittedBids: () => CraftsmanBid[];
  getExistingBidForRequest: (requestId: string) => CraftsmanBid | undefined;
  getMarketplaceRequestsForCraftsman: () => CraftsmanRequest[];
}

function generateUniqueId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${ts}-${rand}`;
}

const CURRENT_USER_ID = 'current_user_me';

const SEED_CRAFTSMAN_REQUESTS: CraftsmanRequest[] = [
  {
    id: 'US-seed-01',
    creatorId: 'anon_customer_u1',
    category: 'electrical',
    problemDescription: 'Salon avizesi montajı ve mutfaktaki 3 adet prizin topraklama kontrolü yapılacak.',
    location: 'İstanbul - Ataşehir',
    preferredDateTime: 'Cumartesi 14:00 - 17:00',
    notes: 'Avize kutusunda hazır, merdiven evde mevcuttur.',
    status: 'waiting_bids',
    createdAt: '2026-09-16T05:00:00.000Z',
  },
  {
    id: 'US-seed-02',
    creatorId: 'anon_customer_u2',
    category: 'plumbing',
    problemDescription: 'Banyo lavabosu altındaki sifondan su sızıyor ve batarya gevşemiş.',
    location: 'İstanbul - Üsküdar',
    preferredDateTime: 'Hafta içi akşam 19:00 sonrası',
    notes: 'Gerekli contalar ve yeni batarya hazır.',
    status: 'waiting_bids',
    createdAt: '2026-09-16T04:30:00.000Z',
  },
];

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    if (item && item.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export const useCraftsmanStore = create<CraftsmanStoreState>()(
  persist(
    (set, get) => ({
      currentRole: 'customer',
      currentUserId: CURRENT_USER_ID,
      config: {
        bidCreditFee: 80, // 80 TL Teklif Kredisi
        currency: 'TL',
        allowDirectCalling: false,
        allowDirectMessaging: false,
      },
      myRequests: [],
      openMarketplaceRequests: SEED_CRAFTSMAN_REQUESTS,
      bids: [],

      setCurrentRole: (currentRole) => set({ currentRole }),

      setBidCreditFee: (fee) =>
        set((state) => ({
          config: { ...state.config, bidCreditFee: fee },
        })),

      createCraftsmanRequest: (data) => {
        const newReq: CraftsmanRequest = {
          id: generateUniqueId('US'),
          creatorId: CURRENT_USER_ID,
          category: data.category,
          problemDescription: data.problemDescription.trim(),
          location: data.location.trim(),
          preferredDateTime: data.preferredDateTime || 'En Kısa Sürede / Esnek',
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
        const craftsmanProfile = useProviderAuthStore.getState().getProfile('craftsman');

        // 1. Target request & self-bid check
        const allRequests = [...myRequests, ...openMarketplaceRequests];
        const targetReq = allRequests.find((r) => r.id === data.requestId);
        const requestCreatorId = targetReq?.creatorId || '';

        // 2. Policy Authorization check for serviceType: 'craftsman'
        const authCheck = ProviderPolicy.canSubmitBid({
          serviceType: 'craftsman',
          profile: craftsmanProfile,
          requestCreatorId,
          currentUserId: CURRENT_USER_ID,
        });

        if (!authCheck.allowed) {
          throw new Error(authCheck.reason || 'Usta teklifi verme yetkiniz bulunmamaktadır.');
        }

        const craftsmanId = 'current_craftsman_me';
        const existingBids = get().bids;

        const existingIndex = existingBids.findIndex(
          (b) => b.requestId === data.requestId && b.craftsmanId === craftsmanId
        );

        let updatedBid: CraftsmanBid;

        if (existingIndex !== -1) {
          // Update existing bid to prevent duplicates
          updatedBid = {
            ...existingBids[existingIndex],
            price: data.price,
            bidNote: data.bidNote.trim(),
            estimatedDuration: data.estimatedDuration || existingBids[existingIndex].estimatedDuration,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          const newBids = [...existingBids];
          newBids[existingIndex] = updatedBid;

          set({ bids: deduplicateById(newBids) });
        } else {
          // Create new unique bid
          updatedBid = {
            id: generateUniqueId('UBID'),
            requestId: data.requestId,
            craftsmanId,
            craftsmanAnonymousTitle: `Usta #${generateUniqueId('US')}`,
            price: data.price,
            currency: config.currency,
            bidNote: data.bidNote.trim(),
            estimatedDuration: data.estimatedDuration.trim() || '1-2 Saat',
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
        const matching = allBids.filter((b) => b.craftsmanId === 'current_craftsman_me');
        return deduplicateById(matching);
      },

      getExistingBidForRequest: (requestId) => {
        const allBids = get().bids;
        return allBids.find(
          (b) => b.requestId === requestId && b.craftsmanId === 'current_craftsman_me'
        );
      },

      getMarketplaceRequestsForCraftsman: () => {
        const { openMarketplaceRequests } = get();
        const filtered = ProviderPolicy.filterMarketplaceRequests(
          openMarketplaceRequests,
          CURRENT_USER_ID
        );
        return deduplicateById(filtered);
      },
    }),
    {
      name: 'lifeos-craftsman-dispatch',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.myRequests = deduplicateById(state.myRequests || []);
          state.openMarketplaceRequests = deduplicateById(
            state.openMarketplaceRequests && state.openMarketplaceRequests.length > 0
              ? state.openMarketplaceRequests
              : SEED_CRAFTSMAN_REQUESTS
          );
          state.bids = deduplicateById(state.bids || []);
        }
      },
    }
  )
);
