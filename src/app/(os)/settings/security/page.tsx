'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Key, Smartphone, Clock } from 'lucide-react';
import Link from 'next/link';
import { Dock } from '@/components/os/Dock';
import { useTranslation } from '@/lib/i18n';
import { useLocaleRender } from '@/lib/i18n/runtime';

export default function SecurityPage() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const { t: tr } = useTranslation();

  const t = {
    title: tr.settings.security,
    changePassword: tr.settings.changePassword,
    changePasswordDesc: tr.settings.changePasswordDesc,
    twoFactor: tr.settings.twoFactor,
    twoFactorDesc: tr.settings.twoFactorDesc,
    passkey: tr.settings.passkey,
    passkeyDesc: tr.settings.passkeyDesc,
    sessions: tr.settings.sessions,
    sessionsDesc: tr.settings.sessionsDesc,
    loginHistory: tr.settings.loginHistory,
    loginHistoryDesc: tr.settings.loginHistoryDesc,
    comingSoon: tr.common.soon,
  };

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
          <h1 className="text-2xl font-bold text-foreground">{localizeText(t.title)}</h1>
        </motion.div>

        {/* Security options */}
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { icon: Key, label: t.changePassword, desc: t.changePasswordDesc, available: true, href: '#change-password' },
            { icon: Shield, label: t.twoFactor, desc: t.twoFactorDesc, available: false },
            { icon: Smartphone, label: t.passkey, desc: t.passkeyDesc, available: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 px-4 py-4 ${!item.available ? 'opacity-50' : 'hover:bg-muted/50 cursor-pointer'} transition-colors`}
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{localizeText(item.label)}</div>
                <div className="text-xs text-muted-foreground">{localizeText(item.desc)}</div>
              </div>
              {!item.available && (
                <span className="text-xs text-blue-400 flex-shrink-0">{localizeText(t.comingSoon)}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 mx-4 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { icon: Smartphone, label: t.sessions, desc: t.sessionsDesc },
            { icon: Clock, label: t.loginHistory, desc: t.loginHistoryDesc },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-4 py-4 opacity-50">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{localizeText(item.label)}</div>
                <div className="text-xs text-muted-foreground">{localizeText(item.desc)}</div>
              </div>
              <span className="text-xs text-blue-400 flex-shrink-0">{localizeText(t.comingSoon)}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 px-6 text-xs text-muted-foreground">
          {localizeText('2FA, Passkey ve oturum yönetimi yakında LifeOS\'a gelecek.')}
        </p>
      </div>
      <Dock />
    </div>
  );
}
