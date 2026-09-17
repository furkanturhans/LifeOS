export type NotificationCategoryKey =
  | 'family'
  | 'finance'
  | 'arcade'
  | 'explore'
  | 'system';

export type NotificationPreferenceLevel = 'all' | 'important' | 'silent' | 'off';

export interface NotificationCategoryDefinition {
  id: NotificationCategoryKey;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  iconEmoji: string;
  iconName: string;
  accentBg: string;
  accentText: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategoryDefinition[] = [
  {
    id: 'family',
    titleTr: 'Aile',
    titleEn: 'Family',
    descriptionTr: 'Ortak etkinlikler, anılar ve aile içi bildirimler',
    descriptionEn: 'Shared events, memories, and family alerts',
    iconEmoji: '👨‍👩‍👧',
    iconName: 'Users',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-500',
  },
  {
    id: 'finance',
    titleTr: 'Finans',
    titleEn: 'Finance',
    descriptionTr: 'Bütçe uyarıları, fatura hatırlatıcıları ve özetler',
    descriptionEn: 'Budget alerts, bill reminders, and summaries',
    iconEmoji: '💰',
    iconName: 'Wallet',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-500',
  },
  {
    id: 'arcade',
    titleTr: 'Arcade',
    titleEn: 'Arcade',
    descriptionTr: 'Günlük görevler, başarım kilitleri ve skor güncellemeleri',
    descriptionEn: 'Daily quests, achievement unlocks, and score updates',
    iconEmoji: '🎮',
    iconName: 'Gamepad2',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-500',
  },
  {
    id: 'explore',
    titleTr: 'Keşfet',
    titleEn: 'Explore',
    descriptionTr: 'Topluluk duyuruları, öne çıkan başlıklar ve ilgi alanları',
    descriptionEn: 'Community announcements, highlighted topics, and interests',
    iconEmoji: '🧭',
    iconName: 'Compass',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-500',
  },
  {
    id: 'system',
    titleTr: 'Sistem',
    titleEn: 'System',
    descriptionTr: 'Güvenlik alarmları, cihaz güncellemeleri ve LifeOS duyuruları',
    descriptionEn: 'Security alerts, device updates, and LifeOS announcements',
    iconEmoji: '⚙️',
    iconName: 'Settings',
    accentBg: 'bg-indigo-500/10',
    accentText: 'text-indigo-500',
  },
];

export const NOTIFICATION_PREFERENCE_OPTIONS: {
  id: NotificationPreferenceLevel;
  labelTr: string;
  labelEn: string;
  descriptionTr: string;
  descriptionEn: string;
}[] = [
  {
    id: 'all',
    labelTr: 'Tümü',
    labelEn: 'All',
    descriptionTr: 'Tüm bildirimleri anlık ilet',
    descriptionEn: 'Deliver all notifications instantly',
  },
  {
    id: 'important',
    labelTr: 'Önemliler',
    labelEn: 'Important Only',
    descriptionTr: 'Yalnızca kritik ve öncelikli uyarılar',
    descriptionEn: 'Only critical and high-priority alerts',
  },
  {
    id: 'silent',
    labelTr: 'Sessiz',
    labelEn: 'Silent',
    descriptionTr: 'Ses çalmadan merkeze kaydet',
    descriptionEn: 'Log to center without alert sounds',
  },
  {
    id: 'off',
    labelTr: 'Kapalı',
    labelEn: 'Off',
    descriptionTr: 'Bu kategorideki bildirimleri durdur',
    descriptionEn: 'Mute notifications in this category',
  },
];

export interface NotificationItem {
  id: string;
  category: NotificationCategoryKey;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
}
