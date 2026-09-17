import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransportRequest, UserRoleInService, MovingCategory } from '@/types/services';

interface ServicesState {
  userRole: UserRoleInService;
  activeRequests: TransportRequest[];
  selectedService: string | null;
  setUserRole: (role: UserRoleInService) => void;
  createTransportRequest: (data: {
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
  }) => void;
  removeRequest: (id: string) => void;
}

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      userRole: 'customer',
      activeRequests: [],
      selectedService: null,

      setUserRole: (userRole) => set({ userRole }),

      createTransportRequest: (data) => {
        const newRequest: TransportRequest = {
          id: `req_${Date.now()}`,
          category: data.category,
          fromLocation: data.fromLocation,
          toLocation: data.toLocation,
          movingDate: data.movingDate,
          roomInfo: data.roomInfo || '2+1',
          floorFrom: data.floorFrom || 1,
          floorTo: data.floorTo || 1,
          hasElevatorFrom: data.hasElevatorFrom ?? true,
          hasElevatorTo: data.hasElevatorTo ?? true,
          notes: data.notes || '',
          createdAt: new Date().toISOString(),
          status: 'bidding',
          bidsCount: 0,
        };

        set({
          activeRequests: [newRequest, ...get().activeRequests],
        });
      },

      removeRequest: (id) =>
        set({
          activeRequests: get().activeRequests.filter((r) => r.id !== id),
        }),
    }),
    {
      name: 'lifeos-services',
    }
  )
);
