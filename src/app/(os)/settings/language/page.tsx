'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Search, Globe } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { useTranslation, SUPPORTED_LANGUAGES, getLanguageName } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { LocalePreference } from '@/types/user';
import { useLocaleRender } from '@/lib/i18n/runtime';

export default function LanguagePage() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        getLanguageName(lang.code, locale).toLocaleLowerCase(locale).includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery, locale]);

  const handleSelectLanguage = (code: LocalePreference) => {
    setLocale(code);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Üst Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 pt-12 pb-4"
        >
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-muted/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            aria-label={localizeText(t.common.back)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              {localizeText(t.settings.language)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {localizeText(t.settings.languageSubtitle)}
            </p>
          </div>
        </motion.div>

        {/* Dil Arama Kutusu */}
        <div className="mx-4 mb-4">
          <div className="relative flex items-center">
            <Search className="absolute start-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={localizeText(t.common.search)}
              className="w-full h-11 ps-10 pe-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>

        {/* Dil Listesi */}
        <div className="mx-4 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm divide-y divide-border/60">
          {filteredLanguages.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectLanguage(lang.code)}
                className={cn(
                  'flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors',
                  isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}
              >
                <span className="text-2xl select-none" role="img" aria-label={getLanguageName(lang.code, locale)}>
                  {localizeText(lang.flag)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span lang={lang.code} dir={lang.dir} translate="no">{lang.nativeName}</span>
                    {isSelected && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{localizeText("Aktif")}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{getLanguageName(lang.code, locale)}</div>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
                    <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[2.5]" />
                  </div>
                )}
              </motion.button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {localizeText(t.common.noResults)}{localizeText("\"")}{localizeText(searchQuery)}{localizeText("\"")}</div>
          )}
        </div>

        <p className="mt-4 px-6 text-xs text-muted-foreground text-center">{localizeText("20 küresel dil tam entegrasyonla desteklenmektedir.")}</p>
      </div>
      <Dock />
    </div>
  );
}
