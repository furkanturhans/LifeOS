'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  AtSign,
  Pencil,
  Check,
  X,
  AlertCircle,
  Key,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cleanLifeOSId, isValidLifeOSId, formatLifeOSId } from '@/lib/utils';

type FieldKey = 'displayName' | 'lifeosId';

interface SaveState {
  loading: boolean;
  saved: boolean;
  error: string | null;
}

const defaultSaveState: SaveState = { loading: false, saved: false, error: null };

export default function AccountSettingsPage() {
  const { user, setUser } = useAuthStore();

  const [editing, setEditing] = useState<FieldKey | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [saveState, setSaveState] = useState<SaveState>(defaultSaveState);

  function startEditing(field: FieldKey) {
    const currentValue =
      field === 'displayName' ? user?.displayName || '' : user?.lifeosId || '';
    setTempValue(currentValue);
    setEditing(field);
    setSaveState(defaultSaveState);
  }

  function cancelEditing() {
    setEditing(null);
    setTempValue('');
    setSaveState(defaultSaveState);
  }

  async function handleSave(field: FieldKey) {
    if (!user) {
      setSaveState({ loading: false, saved: false, error: 'Kullanıcı oturumu bulunamadı.' });
      return;
    }

    setSaveState({ loading: true, saved: false, error: null });

    let payload: Record<string, string> = {};

    if (field === 'displayName') {
      const trimmed = tempValue.trim();
      if (!trimmed || trimmed.length < 2) {
        setSaveState({ loading: false, saved: false, error: 'Ad soyad en az 2 karakter olmalıdır.' });
        return;
      }
      payload = { displayName: trimmed };
    } else if (field === 'lifeosId') {
      const cleaned = cleanLifeOSId(tempValue);
      if (!isValidLifeOSId(cleaned)) {
        setSaveState({
          loading: false,
          saved: false,
          error: 'LifeOS ID 3-20 karakter, sadece küçük harf, rakam ve _ içerebilir.',
        });
        return;
      }
      payload = { lifeosId: cleaned };
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...payload }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveState({ loading: false, saved: false, error: data.error || 'Kaydedilemedi.' });
        return;
      }

      // Update local store with the server-confirmed values
      setUser({ ...user, ...data.user });
      setSaveState({ loading: false, saved: true, error: null });
      setTimeout(() => {
        setEditing(null);
        setTempValue('');
        setSaveState(defaultSaveState);
      }, 1200);
    } catch {
      // Offline: apply locally
      setUser({ ...user, ...payload });
      setSaveState({ loading: false, saved: true, error: null });
      setTimeout(() => {
        setEditing(null);
        setTempValue('');
        setSaveState(defaultSaveState);
      }, 1200);
    }
  }

  const fields: {
    key: FieldKey;
    label: string;
    icon: React.ReactNode;
    description: string;
    display: string;
    hint?: string;
  }[] = [
    {
      key: 'displayName',
      label: 'Ad Soyad',
      icon: <User className="w-4 h-4" />,
      description: 'Profilinizde görünecek tam adınız',
      display: user?.displayName || '—',
    },
    {
      key: 'lifeosId',
      label: 'LifeOS ID',
      icon: <AtSign className="w-4 h-4" />,
      description: 'Benzersiz kullanıcı tanımlayıcınız',
      display: user?.lifeosId ? `@${user.lifeosId}` : '—',
      hint:
        editing === 'lifeosId' && tempValue
          ? `Görünüm: ${formatLifeOSId(tempValue)}`
          : undefined,
    },
  ];

  return (
    <div className="min-h-screen pb-28 pt-8 px-4 max-w-lg mx-auto">
      {/* Header */}
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

      <div className="space-y-3">
        {/* Editable fields */}
        {fields.map((field) => {
          const isActive = editing === field.key;

          return (
            <div
              key={field.key}
              className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden transition-all"
            >
              {/* Field header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-primary">{field.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{field.label}</p>
                    <p className="text-[11px] text-muted-foreground">{field.description}</p>
                  </div>
                </div>
                {!isActive && (
                  <button
                    onClick={() => startEditing(field.key)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-primary/80 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Düzenle
                  </button>
                )}
              </div>

              {/* Current value (collapsed state) */}
              {!isActive && (
                <div className="px-5 pb-4">
                  <span className="text-sm font-medium text-foreground/80">{field.display}</span>
                </div>
              )}

              {/* Edit form (expanded state) */}
              {isActive && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-3">
                  <Input
                    label=""
                    value={tempValue}
                    onChange={(e) => {
                      setSaveState(defaultSaveState);
                      setTempValue(e.target.value);
                    }}
                    placeholder={field.key === 'lifeosId' ? 'furkan' : 'Adınızı girin'}
                    icon={field.icon}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(field.key);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />

                  {field.hint && (
                    <p className="text-[11px] text-muted-foreground px-1">
                      {field.hint.split(':')[0]}:{' '}
                      <span className="font-semibold text-primary">{field.hint.split(':')[1]}</span>
                    </p>
                  )}

                  {saveState.error && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 flex items-start gap-2 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{saveState.error}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 bg-card/60 hover:bg-card text-xs font-medium text-muted-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      İptal
                    </button>
                    <button
                      onClick={() => handleSave(field.key)}
                      disabled={saveState.loading || saveState.saved}
                      className="flex-[2] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-70"
                    >
                      {saveState.loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saveState.saved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          Kaydedildi
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Email — read-only card */}
        <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-foreground">E-posta Adresi</p>
                <p className="text-[11px] text-muted-foreground">Hesap e-postanız</p>
              </div>
            </div>
            <span className="text-[10px] font-medium bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full border border-white/5">
              Değiştirilemez
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground/60 pl-[26px]">
            {user?.email || 'user@lifeos.local'}
          </p>
        </div>

        {/* Password card */}
        <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Şifre ve Doğrulama
          </h2>
          <p className="text-xs text-muted-foreground">
            Şifrenizi yenilemek veya güvenlik anahtarı bağlamak için doğrulama e-postası
            talep edebilirsiniz.
          </p>
          <Button variant="outline" size="sm" type="button" className="w-full">
            Şifre Sıfırlama E-postası Gönder
          </Button>
        </div>
      </div>
    </div>
  );
}
