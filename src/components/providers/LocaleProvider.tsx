'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { LANGUAGE_MAP } from '@/lib/i18n/languages';
import { usePathname } from 'next/navigation';
import { localizeText } from '@/lib/i18n/runtime';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useThemeStore(state => state.locale);
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LANGUAGE_MAP.get(locale)?.dir ?? 'ltr';
    const title = pathname === '/login' ? 'Giriş Yap' : pathname === '/register' ? 'Kayıt Ol' : null;
    document.title = title ? `${localizeText(title, locale)} — LifeOS` : 'LifeOS';
  }, [locale, pathname]);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center" aria-busy="true"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return children;
}
