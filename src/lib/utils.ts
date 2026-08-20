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

export function formatDate(date: Date, locale: string = 'tr'): string {
  const localeStr = locale === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleDateString(localeStr, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getGreeting(date: Date, locale: string = 'tr'): string {
  const hour = date.getHours();
  if (locale === 'tr') {
    if (hour >= 5 && hour < 12) return 'Günaydın';
    if (hour >= 12 && hour < 17) return 'İyi günler';
    if (hour >= 17 && hour < 21) return 'İyi akşamlar';
    return 'İyi geceler';
  } else {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }
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
