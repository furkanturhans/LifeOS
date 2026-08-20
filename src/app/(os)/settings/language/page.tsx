'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';
import type { LocalePreference } from '@/types/user';

const LANGUAGES: { value: LocalePreference; flag: string; name: string; nativeName: string; available: boolean }[] = [
  { value: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe', available: true },
  { value: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English', available: true },
];

export default function LanguagePage() {
  const router = useRouter();
  const { locale, setLocale } = useThemeStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 pt-12 pb-6"
        >
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'tr' ? 'Dil' : 'Language'}
          </h1>
        </motion.div>

        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => lang.available && setLocale(lang.value)}
              className={cn(
                'flex w-full items-center gap-4 px-4 py-4 text-left transition-colors',
                lang.available ? 'hover:bg-muted/50' : 'opacity-40 cursor-not-allowed'
              )}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{lang.nativeName}</div>
                <div className="text-xs text-muted-foreground">{lang.name}</div>
              </div>
              {locale === lang.value && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <p className="mt-4 px-6 text-xs text-muted-foreground">
          {locale === 'tr'
            ? 'Daha fazla dil desteği yakında eklenecek.'
            : 'More language support coming soon.'}
        </p>
      </div>
      <Dock />
    </div>
  );
}
