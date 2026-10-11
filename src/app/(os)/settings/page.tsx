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
  const localizeText = useLocaleRender();
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{localizeText(label)}</div>
          {value && <div className="text-xs text-muted-foreground">{localizeText(value)}</div>}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const localizeText = useLocaleRender();
  return (
    <div className="mt-4">
      <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {localizeText(title)}
      </p>
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

import { useTranslation, LANGUAGE_MAP } from '@/lib/i18n';
import { useLocaleRender } from '@/lib/i18n/runtime';

export default function SettingsPage() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { theme } = useThemeStore();

  const themeLabels = {
    light: t.settings.light,
    dark: t.settings.dark,
    system: t.settings.system,
  };

  const activeLangName = LANGUAGE_MAP.get(locale)?.nativeName || locale;

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
            {localizeText(t.settings.title)}
          </h1>
        </motion.div>

        {/* Appearance */}
        <SettingsSection title={localizeText(t.settings.appearance)}>
          <SettingsRow
            label={localizeText(t.settings.theme)}
            value={themeLabels[theme]}
            href="/settings/appearance"
          />
        </SettingsSection>

        {/* Language */}
        <SettingsSection title={localizeText(t.settings.language)}>
          <SettingsRow
            label={localizeText(t.settings.appLanguage)}
            value={activeLangName}
            href="/settings/language"
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title={localizeText(t.settings.notifications)}>
          <SettingsRow
            label={localizeText(t.settings.notificationPrefs)}
            href="/settings/notifications"
          />
        </SettingsSection>

        {/* Security */}
        <SettingsSection title={localizeText(t.settings.security)}>
          <SettingsRow label={localizeText(t.settings.changePassword)} href="/settings/security" />
          <SettingsRow label={localizeText(t.settings.sessions)} href="/settings/security#sessions" />
          <SettingsRow label={localizeText(t.settings.loginHistory)} href="/settings/security#history" />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title={localizeText(t.settings.privacy)}>
          <SettingsRow label={localizeText(t.settings.privacy)} href="/settings/privacy" />
          <SettingsRow label={localizeText("Veri Yönetimi")} href="/settings/privacy#data" />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title={localizeText(t.settings.account)}>
          <SettingsRow label={localizeText(t.settings.account)} href="/settings/account" />
          <SettingsRow label={localizeText(t.settings.devices)} href="/settings/devices" />
        </SettingsSection>
      </div>

      <Dock />
    </div>
  );
}
