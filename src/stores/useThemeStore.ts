import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePreference, LocalePreference, BackgroundType, AccentColor } from '@/types/user';
import { LANGUAGE_MAP } from '@/lib/i18n/languages';

interface ThemeState {
  theme: ThemePreference;
  accentColor: AccentColor;
  reducedMotion: boolean;
  locale: LocalePreference;
  resolvedTheme: 'light' | 'dark';
  backgroundType: BackgroundType;
  backgroundValue: string | null;
  setTheme: (theme: ThemePreference) => void;
  setAccentColor: (accent: AccentColor) => void;
  setReducedMotion: (reduced: boolean) => void;
  setLocale: (locale: LocalePreference) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
  setBackground: (type: BackgroundType, value: string | null) => void;
  resetBackground: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      accentColor: 'blue',
      reducedMotion: false,
      locale: 'tr',
      resolvedTheme: 'light',
      backgroundType: 'default',
      backgroundValue: null,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setLocale: (locale) => {
        if (LANGUAGE_MAP.has(locale)) set({ locale });
      },
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setBackground: (backgroundType, backgroundValue) => set({ backgroundType, backgroundValue }),
      resetBackground: () => set({ backgroundType: 'default', backgroundValue: null }),
    }),
    {
      name: 'lifeos-theme',
      merge: (persisted, current) => {
        const saved = persisted as Partial<ThemeState> | undefined;
        return {
          ...current,
          ...saved,
          locale: saved?.locale && LANGUAGE_MAP.has(saved.locale) ? saved.locale : current.locale,
        };
      },
    }
  )
);
