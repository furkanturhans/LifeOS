'use client';

import { useThemeStore } from '@/stores/useThemeStore';
import type { LocalePreference } from '@/types/user';
import { translations, type TranslationDictionary } from './translations';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from './languages';

export * from './languages';
export * from './translations';

/**
 * Verilen dildeki çeviri sözlüğünü döner. Dil bulunamazsa varsayılan olarak İngilizce (en) döner.
 */
export function getTranslation(locale: LocalePreference | string = 'tr'): TranslationDictionary {
  const loc = Object.hasOwn(translations, locale) ? (locale as LocalePreference) : 'en';
  return translations[loc] || translations.tr;
}

/**
 * React bileşenlerinde anlık dil durumuna bağlı çevirileri sağlayan hook.
 */
export function useTranslation() {
  const { locale, setLocale } = useThemeStore();
  const t = getTranslation(locale);
  const currentLanguage = LANGUAGE_MAP.get(locale) || SUPPORTED_LANGUAGES[0];

  return {
    t,
    locale,
    setLocale,
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    isRTL: currentLanguage.dir === 'rtl',
  };
}

/**
 * Günün saatine ve seçili dile göre uygun selamlamayı üretir.
 */
export function getLocalizedGreeting(locale: LocalePreference = 'tr'): string {
  const hour = new Date().getHours();
  const dict = getTranslation(locale).greetings;

  if (hour >= 5 && hour < 12) return dict.morning;
  if (hour >= 12 && hour < 17) return dict.afternoon;
  if (hour >= 17 && hour < 22) return dict.evening;
  return dict.night;
}

/**
 * Seçili dile uygun tarih formatı döner.
 */
export function formatLocalizedDate(
  date: Date = new Date(),
  locale: LocalePreference = 'tr',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  const localeCodeMap: Record<LocalePreference, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pt: 'pt-BR',
    ru: 'ru-RU',
    ar: 'ar-SA',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    nl: 'nl-NL',
    pl: 'pl-PL',
    sv: 'sv-SE',
    az: 'az-AZ',
    hi: 'hi-IN',
    id: 'id-ID',
    uk: 'uk-UA',
    el: 'el-GR',
  };

  const tag = localeCodeMap[locale] || 'tr-TR';
  try {
    return new Intl.DateTimeFormat(tag, options || defaultOptions).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
  }
}
