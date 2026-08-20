'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Dock } from '@/components/os/Dock';
import { useThemeStore } from '@/stores/useThemeStore';

interface SettingsRowProps {
  label: string;
  value?: string;
  href: string;
}

function SettingsRow({ label, value, href }: SettingsRowProps) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{label}</div>
          {value && <div className="text-xs text-muted-foreground">{value}</div>}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { locale, theme } = useThemeStore();

  const themeLabels = { light: locale === 'tr' ? 'Açık' : 'Light', dark: locale === 'tr' ? 'Koyu' : 'Dark', system: locale === 'tr' ? 'Sistem' : 'System' };
  const localeLabels = { tr: 'Türkçe', en: 'English' };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 pt-12 pb-4"
        >
          <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'tr' ? 'Ayarlar' : 'Settings'}
          </h1>
        </motion.div>

        {/* Appearance */}
        <SettingsSection title={locale === 'tr' ? 'Görünüm' : 'Appearance'}>
          <SettingsRow
            label={locale === 'tr' ? 'Tema' : 'Theme'}
            value={themeLabels[theme]}
            href="/settings/appearance"
          />
        </SettingsSection>

        {/* Language */}
        <SettingsSection title={locale === 'tr' ? 'Dil' : 'Language'}>
          <SettingsRow
            label={locale === 'tr' ? 'Uygulama Dili' : 'App Language'}
            value={localeLabels[locale]}
            href="/settings/language"
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title={locale === 'tr' ? 'Bildirimler' : 'Notifications'}>
          <SettingsRow
            label={locale === 'tr' ? 'Bildirim Tercihleri' : 'Notification Preferences'}
            href="/settings/notifications"
          />
        </SettingsSection>

        {/* Security */}
        <SettingsSection title={locale === 'tr' ? 'Güvenlik' : 'Security'}>
          <SettingsRow label={locale === 'tr' ? 'Şifre Değiştir' : 'Change Password'} href="/settings/security" />
          <SettingsRow label={locale === 'tr' ? 'Oturumlar' : 'Sessions'} href="/settings/security#sessions" />
          <SettingsRow label={locale === 'tr' ? 'Giriş Geçmişi' : 'Login History'} href="/settings/security#history" />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title={locale === 'tr' ? 'Gizlilik' : 'Privacy'}>
          <SettingsRow label={locale === 'tr' ? 'Gizlilik Ayarları' : 'Privacy Settings'} href="/settings/privacy" />
          <SettingsRow label={locale === 'tr' ? 'Veri Yönetimi' : 'Data Management'} href="/settings/privacy#data" />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title={locale === 'tr' ? 'Hesap' : 'Account'}>
          <SettingsRow label={locale === 'tr' ? 'Hesap Bilgileri' : 'Account Info'} href="/settings/account" />
          <SettingsRow label={locale === 'tr' ? 'Cihazlar' : 'Devices'} href="/settings/devices" />
        </SettingsSection>
      </div>

      <Dock />
    </div>
  );
}
