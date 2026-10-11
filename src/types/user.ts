export type ThemePreference = 'light' | 'dark' | 'system';
export type LocalePreference =
  | 'tr'
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'pt'
  | 'ru'
  | 'ar'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'nl'
  | 'pl'
  | 'sv'
  | 'az'
  | 'hi'
  | 'id'
  | 'uk'
  | 'el';
export type BackgroundType = 'default' | 'color' | 'image';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange';

export interface UserProfile {
  id: string;
  supabaseId: string;
  lifeosId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  locale: LocalePreference;
  theme: ThemePreference;
  accentColor?: AccentColor;
  reducedMotion?: boolean;
  backgroundType?: 'default' | 'color' | 'image';
  backgroundValue?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  deviceInfo: DeviceInfo;
  ipAddress: string | null;
  lastSeen: string;
  createdAt: string;
}

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  userAgent?: string;
}
