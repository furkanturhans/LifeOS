import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExplorePrivacySettings, VisibilityScope } from '@/types/explore';

interface ExploreState {
  privacySettings: ExplorePrivacySettings;
  activeSection: string;
  setFamilySafeMode: (enabled: boolean) => void;
  setDefaultVisibility: (scope: VisibilityScope) => void;
  setActiveSection: (section: string) => void;
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set) => ({
      privacySettings: {
        defaultVisibility: 'family_only',
        familySafeMode: true,
        allowCommunityInvites: true,
        hideActivityStatus: true,
      },
      activeSection: 'for_you',

      setFamilySafeMode: (familySafeMode) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, familySafeMode },
        })),

      setDefaultVisibility: (defaultVisibility) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, defaultVisibility },
        })),

      setActiveSection: (activeSection) => set({ activeSection }),
    }),
    {
      name: 'lifeos-explore',
    }
  )
);
