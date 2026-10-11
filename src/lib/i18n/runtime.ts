'use client';

import { useThemeStore } from '@/stores/useThemeStore';
import { useCallback } from 'react';
import type { LocalePreference } from '@/types/user';
import rawCatalog from './catalog.json';
import overrides from './overrides.json';

type Catalog = Record<string, Partial<Record<LocalePreference, string>>>;
const catalog: Catalog = rawCatalog;
for (const [source, entries] of Object.entries(overrides)) {
  catalog[source] = { ...catalog[source], ...entries };
}
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const entities: Record<string, string> = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>', nbsp: ' ', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—' };
const decode = (value: string) => value.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (match, entity: string) => {
  if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
  if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
  return entities[entity] ?? match;
});

const index = new Map<string, string>();
const englishIndex = new Map<string, string>();
for (const [source, entries] of Object.entries(catalog)) {
  const key = normalize(decode(source));
  index.set(key, source);
  // Supports older screens that previously switched only between Turkish and English.
  if (entries.en && !englishIndex.has(normalize(entries.en))) englishIndex.set(normalize(entries.en), source);
}
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.keys(catalog).filter(s => /\{\d+\}/.test(s)).map(source => ({
  source,
  regex: new RegExp('^' + normalize(decode(source)).split(/\{\d+\}/).map(escape).join('(.+?)') + '$'),
}));

/** Subscribe once per screen/component so all text and formatting updates together. */
export function useLocaleRender() {
  const locale = useThemeStore(state => state.locale);
  return useCallback(<T,>(value: T): T => localizeText(value, locale), [locale]);
}

export function getFormattingLocale(): string {
  return useThemeStore.getState().locale;
}

/** Translate known application copy. Unknown values (including user content) stay intact. */
export function localizeText<T>(value: T, locale: LocalePreference = useThemeStore.getState().locale): T {
  if (typeof value !== 'string') return value;
  const decoded = decode(value);
  const key = normalize(decoded);
  if (!key) return decoded as T;
  const source = index.get(key) ?? englishIndex.get(key);
  if (source) {
    const result = decode(catalog[source][locale] ?? source);
    // Preserve leading/trailing whitespace used between inline React children.
    return decoded.replace(decoded.trim(), result) as T;
  }
  for (const pattern of patterns) {
    const match = pattern.regex.exec(key);
    if (!match) continue;
    const translated = catalog[pattern.source][locale] ?? (locale === 'tr' ? pattern.source : undefined);
    if (!translated) continue;
    return decode(translated).replace(/\{(\d+)\}/g, (_, number: string) => match[Number(number) + 1] ?? '') as T;
  }
  return value;
}
