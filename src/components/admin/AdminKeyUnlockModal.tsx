'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminKeyUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminKeyUnlockModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminKeyUnlockModalProps) {
  const [securityKey, setSecurityKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = securityKey.trim();

    if (!trimmed) {
      setErrorMessage('Lütfen güvenlik anahtarını giriniz.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/auth/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmed, userId: 'user_local' }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        sessionStorage.setItem('lifeos_admin_key_unlocked', 'true');
        setTimeout(() => {
          setIsLoading(false);
          setIsSuccess(false);
          setSecurityKey('');
          onSuccess();
        }, 1000);
      } else {
        setIsLoading(false);
        setErrorMessage(data.error || 'Geçersiz 2. güvenlik anahtarı.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Doğrulama sunucusuna bağlanılamadı.');
    }
  };

  const currentLength = securityKey.trim().length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-card border border-border/90 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 relative"
        >
          {/* Glowing Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-primary to-purple-600" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xl font-bold shadow-xs">
                🔐
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Yönetici Güvenlik Kasası</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.2 rounded-full border border-amber-500/20">
                    22-Key 2FA
                  </span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Yalnızca size özel 22 haneli master şifre koruması
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Content */}
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Kasa Kilidi Açıldı</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Yönetim paneline yönlendiriliyorsunuz...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-foreground">
                    22 Haneli Master Anahtar:
                  </label>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      currentLength === 22 ? 'text-emerald-500' : 'text-muted-foreground'
                    }`}
                  >
                    {currentLength} / 22
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={securityKey}
                    onChange={(e) => {
                      setSecurityKey(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="LIFEOS-ADMIN-2026-KEY22"
                    maxLength={32}
                    autoFocus
                    required
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 pr-11 font-mono text-xs text-foreground tracking-wider focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showKey ? 'Gizle' : 'Göster'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Key Hint / Safe Note */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Kriptografik Koruma & İki Aşamalı Kilit</span>
                </div>
                <p>
                  Yönetim panelindeki hassas onay ve kullanıcı kısıtlama yetkileri bu anahtar doğrulanmadan çalıştırılamaz.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isLoading || !securityKey.trim()}
                  className="h-10 px-5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20"
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Kilidi Aç & Panele Gir'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
