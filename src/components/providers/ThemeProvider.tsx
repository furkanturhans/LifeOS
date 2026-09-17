'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accentColor, reducedMotion, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(resolved: 'light' | 'dark') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.setAttribute('data-theme', resolved);
      root.style.colorScheme = resolved;
      setResolvedTheme(resolved);
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(theme as 'light' | 'dark');
    }
  }, [theme, setResolvedTheme]);

  // Accent Color
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor || 'blue');
  }, [accentColor]);

  // Reduced Motion
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
  }, [reducedMotion]);

  return <>{children}</>;
}
