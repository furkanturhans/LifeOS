import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TaxiRequest,
  TaxiBid,
  TaxiPlatformConfig,
} from '@/types/taxi';
import { ProviderPolicy } from '@/lib/services/providerPolicy';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';

interface TaxiStoreState {
  currentRole: 'customer' | 'provider';
  currentUserId: string;
  config: TaxiPlatformConfig;
  myRequests: TaxiRequest[];
  openMarketplaceRequests: TaxiRequest[];
  bids: TaxiBid[];

  // Actions
  setCurrentRole: (role: 'customer' | 'provider') => void;
  setBidCreditFee: (fee: number) => void;
  createTaxiRequest: (data: {
    pickupLocation: string;
    dropoffLocation: string;
    requestedDateTime: string;
    passengerCount: number;
    notes?: string;
  }) => TaxiRequest;
  submitBid: (data: {
    requestId: string;
    price: number;
    bidNote: string;
    vehicleType?: string;
  }) => TaxiBid;
  acceptBid: (requestId: string, bidId: string) => void;
  cancelRequest: (requestId: string) => void;
  getBidsForMyRequest: (requestId: string) => TaxiBid[];
  getMySubmittedBids: () => TaxiBid[];
  getExistingBidForRequest: (requestId: string) => TaxiBid | undefined;
  getMarketplaceRequestsForDriver: () => TaxiRequest[];
}

function generateUniqueId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${ts}-${rand}`;
}

const CURRENT_USER_ID = 'current_user_me';

const SEED_TAXI_REQUESTS: TaxiRequest[] = [
  {
    id: 'TX-seed-01',
    creatorId: 'anon_passenger_1',
    pickupLocation: 'İstanbul - Kadıköy Rıhtım',
    dropoffLocation: 'İstanbul - Sabiha Gökçen Havalimanı',
    requestedDateTime: 'Bugün 18:30',
    passengerCount: 2,
    notes: '2 adet orta boy valizimiz var, geniş bagajlı araç tercih edilir.',
    status: 'waiting_bids',
    createdAt: '2026-09-16T06:00:00.000Z',
  },
  {
    id: 'TX-seed-02',
    creatorId: 'anon_passenger_2',
    pickupLocation: 'İstanbul - Beşiktaş Meydan',
    dropoffLocation: 'İstanbul - Maslak Plazalar',
    requestedDateTime: 'Yarın 08:45',
    passengerCount: 1,
    notes: 'İş toplantısı için tam vaktinde kalkış önemlidir.',
    status: 'waiting_bids',
    createdAt: '2026-09-16T05:30:00.000Z',
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

export const useTaxiStore = create<TaxiStoreState>()(
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
      openMarketplaceRequests: SEED_TAXI_REQUESTS,
      bids: [],

      setCurrentRole: (currentRole) => set({ currentRole }),

      setBidCreditFee: (fee) =>
        set((state) => ({
          config: { ...state.config, bidCreditFee: fee },
        })),

      createTaxiRequest: (data) => {
        const newReq: TaxiRequest = {
          id: generateUniqueId('TX'),
          creatorId: CURRENT_USER_ID,
          pickupLocation: data.pickupLocation.trim(),
          dropoffLocation: data.dropoffLocation.trim(),
          requestedDateTime: data.requestedDateTime || 'Hemen / En Kısa Sürede',
          passengerCount: data.passengerCount || 1,
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
        const taxiProfile = useProviderAuthStore.getState().getProfile('taxi');

        // 1. Target request & self-bid check
        const allRequests = [...myRequests, ...openMarketplaceRequests];
        const targetReq = allRequests.find((r) => r.id === data.requestId);
        const requestCreatorId = targetReq?.creatorId || '';

        // 2. Policy Authorization check for serviceType: 'taxi'
        const authCheck = ProviderPolicy.canSubmitBid({
          serviceType: 'taxi',
          profile: taxiProfile,
          requestCreatorId,
          currentUserId: CURRENT_USER_ID,
        });

        if (!authCheck.allowed) {
          throw new Error(authCheck.reason || 'Taksi teklifi verme yetkiniz bulunmamaktadır.');
        }

        const driverId = 'current_driver_me';
        const existingBids = get().bids;

        const existingIndex = existingBids.findIndex(
          (b) => b.requestId === data.requestId && b.driverId === driverId
        );

        let updatedBid: TaxiBid;

        if (existingIndex !== -1) {
          // Update existing bid to prevent duplicates
          updatedBid = {
            ...existingBids[existingIndex],
            price: data.price,
            bidNote: data.bidNote.trim(),
            vehicleType: data.vehicleType || existingBids[existingIndex].vehicleType,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          const newBids = [...existingBids];
          newBids[existingIndex] = updatedBid;

          set({ bids: deduplicateById(newBids) });
        } else {
          // Create new unique bid
          updatedBid = {
            id: generateUniqueId('TBID'),
            requestId: data.requestId,
            driverId,
            driverAnonymousTitle: `Taksi Şoförü #${generateUniqueId('TK')}`,
            vehicleType: data.vehicleType || 'Sarı Taksi - Sedan',
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
        const matching = allBids.filter((b) => b.driverId === 'current_driver_me');
        return deduplicateById(matching);
      },

      getExistingBidForRequest: (requestId) => {
        const allBids = get().bids;
        return allBids.find(
          (b) => b.requestId === requestId && b.driverId === 'current_driver_me'
        );
      },

      getMarketplaceRequestsForDriver: () => {
        const { openMarketplaceRequests } = get();
        const filtered = ProviderPolicy.filterMarketplaceRequests(
          openMarketplaceRequests,
          CURRENT_USER_ID
        );
        return deduplicateById(filtered);
      },
    }),
    {
      name: 'lifeos-taxi-dispatch',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.myRequests = deduplicateById(state.myRequests || []);
          state.openMarketplaceRequests = deduplicateById(
            state.openMarketplaceRequests && state.openMarketplaceRequests.length > 0
              ? state.openMarketplaceRequests
              : SEED_TAXI_REQUESTS
          );
          state.bids = deduplicateById(state.bids || []);
        }
      },
    }
  )
);
