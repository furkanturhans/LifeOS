'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  LogOut,
  Shield,
  Bell,
  Lock,
  Globe,
  Palette,
  User,
  AtSign,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { Dock } from '@/components/os/Dock';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { createClient } from '@/lib/supabase/client';
import { cn, formatLifeOSId, clearSessionCookie } from '@/lib/utils';
import { AdminKeyUnlockModal } from '@/components/admin/AdminKeyUnlockModal';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

function ProfileRow({ icon, label, value, href, onClick, danger }: ProfileRowProps) {
  const localizeText = useLocaleRender();
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer',
        danger && 'text-destructive'
      )}
    >
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
        danger ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
      )}>
        {localizeText(icon)}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('text-sm font-medium', danger ? 'text-destructive' : 'text-foreground')}>
          {localizeText(label)}
        </div>
        {value && (
          <div className="text-xs text-muted-foreground truncate">{value}</div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );

  if (href) {
    return <Link href={href}>{localizeText(content)}</Link>;
  }

  return <div onClick={onClick}>{localizeText(content)}</div>;
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
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

export default function ProfilePage() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { resetBackground } = useThemeStore();
  const [isAdminUnlockOpen, setIsAdminUnlockOpen] = useState(false);

  // Strictly check if current logged in user is the master owner
  const isMasterOwner =
    user?.lifeosId === 'user_local' ||
    user?.id === 'user_local' ||
    user?.email === 'admin@lifeos.internal' ||
    user?.email?.toLowerCase().trim() === 'furkan@lifeos.internal' ||
    user?.lifeosId?.toLowerCase().includes('furkan') ||
    user?.displayName?.toLowerCase().includes('furkan');

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    clearSessionCookie();
    logout();
    resetBackground();
    router.push('/login');
  }

  const t = {
    profile: 'Profil',
    account: 'Hesap',
    appearance: 'Görünüm',
    language: 'Dil',
    notifications: 'Bildirimler',
    security: 'Güvenlik',
    privacy: 'Gizlilik',
    logout: 'Çıkış Yap',
    settings: 'Ayarlar',
    name: 'Ad Soyad',
    email: 'E-posta',
    lifeosId: 'LifeOS ID',
    memberSince: 'Üye olma tarihi',
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(getFormattingLocale(), {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pt-12 pb-2"
        >
          <h1 className="text-2xl font-bold text-foreground">{localizeText(t.profile)}</h1>
        </motion.div>

        {/* Avatar & Identity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mx-4 mt-4 rounded-3xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatarUrl}
              name={user?.displayName ?? 'User'}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {user?.displayName ?? localizeText('LifeOS Kullanıcısı')}
              </h2>
              <p className="text-sm text-primary font-medium">{localizeText(formatLifeOSId(user?.lifeosId))}</p>
              {memberSince && (
                <p className="text-xs text-muted-foreground mt-1">
                  {localizeText(t.memberSince)}: {localizeText(memberSince)}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <button onClick={()=>router.push('/profile/professions')} className="mx-4 mt-4 flex min-h-16 items-center justify-between rounded-2xl border border-border bg-card px-5 text-start"><span className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary"/><span><span className="block text-sm font-semibold">{localizeText('Meslek ve Yetkilerim')}</span><span className="block text-xs text-muted-foreground">{localizeText('Belgeler')} · {localizeText('Doğrulama')}</span></span></span><ChevronRight className="h-4 w-4"/></button>
        {/* SADECE VE SADECE SİZE ÖZEL YÖNETİCİ KASASI (DİĞER HİÇBİR KULLANICI GÖREMEZ) */}
        {isMasterOwner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="mx-4 mt-4 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-transparent p-4.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xl font-bold shadow-xs">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{localizeText("Yönetim Paneli")}</h3>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-500/25">{localizeText("22-Key 2FA")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{localizeText("Başvurular, denetim kayıtları ve sistem yetkileri")}</p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminUnlockOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{localizeText("Kasayı Aç")}</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Account Section */}
        <ProfileSection title={localizeText(t.account)}>
          <ProfileRow
            icon={<User className="h-4 w-4" />}
            label={localizeText(t.name)}
            value={user?.displayName}
            href="/settings/account"
          />
          <ProfileRow
            icon={<AtSign className="h-4 w-4" />}
            label={localizeText(t.lifeosId)}
            value={formatLifeOSId(user?.lifeosId)}
            href="/settings/account"
          />
          <ProfileRow
            icon={<Mail className="h-4 w-4" />}
            label={t.email}
            value={user?.email}
            href="/settings/account"
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title={localizeText(t.settings)}>
          <ProfileRow
            icon={<Palette className="h-4 w-4" />}
            label={localizeText(t.appearance)}
            href="/settings/appearance"
          />
          <ProfileRow
            icon={<Globe className="h-4 w-4" />}
            label={localizeText(t.language)}
            href="/settings/language"
          />
          <ProfileRow
            icon={<Bell className="h-4 w-4" />}
            label={localizeText(t.notifications)}
            href="/settings/notifications"
          />
        </ProfileSection>

        {/* Security Section */}
        <ProfileSection title={localizeText('Güvenlik & Gizlilik')}>
          <ProfileRow
            icon={<Shield className="h-4 w-4" />}
            label={localizeText(t.security)}
            href="/settings/security"
          />
          <ProfileRow
            icon={<Lock className="h-4 w-4" />}
            label={localizeText(t.privacy)}
            href="/settings/privacy"
          />
        </ProfileSection>

        {/* Logout */}
        <div className="mt-4 mx-4">
          <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-card">
            <ProfileRow
              icon={<LogOut className="h-4 w-4" />}
              label={localizeText(t.logout)}
              onClick={handleLogout}
              danger
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-4 text-center">
          <p className="text-xs text-muted-foreground">{localizeText("LifeOS v0.1.0 — Phase 1")}</p>
        </div>
      </div>

      {/* Dock */}
      <Dock />

      {/* 22-Key Admin Key Unlock Modal */}
      <AdminKeyUnlockModal
        isOpen={isAdminUnlockOpen}
        onClose={() => setIsAdminUnlockOpen(false)}
        onSuccess={() => {
          setIsAdminUnlockOpen(false);
          router.push('/admin');
        }}
      />
    </div>
  );
}
