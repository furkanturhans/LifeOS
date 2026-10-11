import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const LOCALE_STRING_MAP: Record<string, string> = {
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

export function formatDate(date: Date, locale: string = 'tr'): string {
  const localeStr = LOCALE_STRING_MAP[locale] || 'tr-TR';
  try {
    return date.toLocaleDateString(localeStr, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}

export function getGreeting(date: Date, locale: string = 'tr'): string {
  const hour = date.getHours();
  const greetingsMap: Record<string, [string, string, string, string]> = {
    tr: ['Günaydın', 'İyi günler', 'İyi akşamlar', 'İyi geceler'],
    en: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
    de: ['Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht'],
    fr: ['Bonjour', 'Bon après-midi', 'Bonsoir', 'Bonne nuit'],
    es: ['Buenos días', 'Buenas tardes', 'Buenas tardes', 'Buenas noches'],
    it: ['Buongiorno', 'Buon pomeriggio', 'Buonasera', 'Buonanotte'],
    pt: ['Bom dia', 'Boa tarde', 'Boa noite', 'Boa noite'],
    ru: ['Доброе утро', 'Добрый день', 'Добрый вечер', 'Доброй ночи'],
    ar: ['صباح الخير', 'مساء الخير', 'مساء الخير', 'تصبح على خير'],
    zh: ['早上好', '下午好', '晚上好', '晚安'],
    ja: ['おはようございます', 'こんにちは', 'こんばんは', 'おやすみなさい'],
    ko: ['좋은 아침입니다', '즐거운 오후입니다', '편안한 저녁입니다', '안녕히 주무세요'],
    nl: ['Goedemorgen', 'Goedemiddag', 'Goedenavond', 'Goedenacht'],
    pl: ['Dzień dobry', 'Miłego popołudnia', 'Dobry wieczór', 'Dobrej nocy'],
    sv: ['God morgon', 'God eftermiddag', 'God kväll', 'God natt'],
    az: ['Sabahınız xeyir', 'Hər vaxtınız xeyir', 'Axşamınız xeyir', 'Gecəniz xeyrə'],
    hi: ['सुप्रभात', 'शुभ दोपहर', 'शुभ संध्या', 'शुभ रात्रि'],
    id: ['Selamat pagi', 'Selamat siang', 'Selamat sore', 'Selamat malam'],
    uk: ['Доброго ранку', 'Доброго дня', 'Доброго вечора', 'Доброї ночі'],
    el: ['Καλημέρα', 'Καλό απόγευμα', 'Καλησπέρα', 'Καληνύχτα'],
  };

  const list = greetingsMap[locale] || greetingsMap.tr;
  if (hour >= 5 && hour < 12) return list[0];
  if (hour >= 12 && hour < 17) return list[1];
  if (hour >= 17 && hour < 22) return list[2];
  return list[3];
}

export function cleanLifeOSId(id: string): string {
  return id
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}

export function formatLifeOSId(id?: string | null): string {
  if (!id) return '@lifeos';
  const cleaned = cleanLifeOSId(id);
  return `@${cleaned}`;
}

export function isValidLifeOSId(id: string): boolean {
  const cleaned = cleanLifeOSId(id);
  return /^[a-z0-9_]{3,20}$/.test(cleaned);
}

export function generateLifeOSId(displayName: string): string {
  const base = cleanLifeOSId(displayName).slice(0, 15) || 'user';
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${base}${suffix}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function setSessionCookie(supabaseId: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `lifeos_session=${supabaseId}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
  }
}

export function clearSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'lifeos_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax';
  }
}

export function generateLocalUserId(): string {
  return 'local_user_' + Date.now();
}
