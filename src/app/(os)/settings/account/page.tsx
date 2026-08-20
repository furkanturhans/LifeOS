'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Key, Save, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cleanLifeOSId, isValidLifeOSId, formatLifeOSId } from '@/lib/utils';

export default function AccountSettingsPage() {
  const { user, setUser, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [lifeosIdInput, setLifeosIdInput] = useState(user?.lifeosId ? cleanLifeOSId(user.lifeosId) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı.');
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Ad soyad en az 2 karakter olmalıdır.');
      return;
    }

    const cleanedUsername = cleanLifeOSId(lifeosIdInput);
    if (!isValidLifeOSId(cleanedUsername)) {
      setError('LifeOS ID 3-20 karakter uzunluğunda olmalı, sadece küçük harf, rakam ve _ içerebilir.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to persist changes in PostgreSQL / Prisma & Supabase
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          displayName: trimmedName,
          lifeosId: cleanedUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Profil güncellenemedi.');
        setIsSubmitting(false);
        return;
      }

      // Update state locally and in persistent store
      const updatedProfile = {
        ...user,
        displayName: trimmedName,
        lifeosId: cleanedUsername,
        updatedAt: new Date().toISOString(),
      };

      setUser(updatedProfile);
      setLifeosIdInput(cleanedUsername);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      // Offline / fallback handling
      const updatedProfile = {
        ...user,
        displayName: trimmedName,
        lifeosId: cleanedUsername,
        updatedAt: new Date().toISOString(),
      };
      setUser(updatedProfile);
      setLifeosIdInput(cleanedUsername);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 pt-8 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/settings"
          className="p-2 rounded-xl bg-card/60 hover:bg-card border border-white/10 text-foreground transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Hesap Bilgileri</h1>
          <p className="text-xs text-muted-foreground">Profil ve kimlik tercihlerinizi yönetin</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 space-y-4">
          <Input
            label="Ad Soyad"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Adınızı girin"
            icon={<User className="w-4 h-4" />}
          />

          <div>
            <Input
              label="LifeOS ID (Kullanıcı Adı)"
              value={lifeosIdInput}
              onChange={(e) => {
                setError(null);
                setLifeosIdInput(e.target.value);
              }}
              placeholder="furkan"
              icon={<span className="text-xs font-bold text-muted-foreground">@</span>}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
              Sistemdeki görünüm: <span className="font-semibold text-primary">{formatLifeOSId(lifeosIdInput)}</span>
            </p>
          </div>

          <Input
            label="E-posta Adresi"
            value={user?.email || 'user@lifeos.local'}
            disabled
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Şifre ve Doğrulama
          </h2>
          <p className="text-xs text-muted-foreground">
            Şifrenizi yenilemek veya güvenlik anahtarı bağlamak için doğrulama e-postası talep edebilirsiniz.
          </p>
          <Button variant="outline" size="sm" type="button" className="w-full">
            Şifre Sıfırlama E-postası Gönder
          </Button>
        </div>

        <Button type="submit" className="w-full gap-2" isLoading={isSubmitting}>
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Değişiklikler Kaydedildi
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
