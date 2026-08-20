import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePreference, LocalePreference, BackgroundType } from '@/types/user';

interface ThemeState {
  theme: ThemePreference;
  locale: LocalePreference;
  resolvedTheme: 'light' | 'dark';
  backgroundType: BackgroundType;
  backgroundValue: string | null;
  setTheme: (theme: ThemePreference) => void;
  setLocale: (locale: LocalePreference) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
  setBackground: (type: BackgroundType, value: string | null) => void;
  resetBackground: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      locale: 'tr',
      resolvedTheme: 'dark',
      backgroundType: 'default',
      backgroundValue: null,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setBackground: (backgroundType, backgroundValue) => set({ backgroundType, backgroundValue }),
      resetBackground: () => set({ backgroundType: 'default', backgroundValue: null }),
    }),
    {
      name: 'lifeos-theme',
    }
  )
);
