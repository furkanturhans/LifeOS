import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  NotificationCategoryKey,
  NotificationPreferenceLevel,
  NotificationItem,
} from '@/types/notifications';

interface NotificationState {
  preferences: Record<NotificationCategoryKey, NotificationPreferenceLevel>;
  notifications: NotificationItem[];
  selectedFilter: 'all' | NotificationCategoryKey;
  setCategoryPreference: (category: NotificationCategoryKey, level: NotificationPreferenceLevel) => void;
  setSelectedFilter: (filter: 'all' | NotificationCategoryKey) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      preferences: {
        family: 'all',
        finance: 'important',
        arcade: 'all',
        explore: 'silent',
        system: 'important',
      },
      notifications: [], // Clean empty list as requested
      selectedFilter: 'all',

      setCategoryPreference: (category, level) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [category]: level,
          },
        })),

      setSelectedFilter: (selectedFilter) => set({ selectedFilter }),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'lifeos-notifications',
    }
  )
);
