'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldAlert, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { SmartDevice } from '@/types/smarthome';

interface SecurityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: SmartDevice | null;
  onConfirm: (pin: string) => Promise<void>;
}

export function SecurityConfirmModal({ isOpen, onClose, device, onConfirm }: SecurityConfirmModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !device) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError('Lütfen 4 haneli güvenlik PIN kodunuzu giriniz.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(pin);
      setIsSubmitting(false);
      onClose();
      setPin('');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Geçersiz güvenlik PIN kodu.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Güvenlik Onayı Zorunlu</span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-bold text-foreground">{device.name}</p>
            <p className="text-muted-foreground">
              Kapı kilidini açmak veya güvenlik alarmını devre dışı bırakmak için lütfen ev güvenlik PIN kodunuzu giriniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="•••• (Örn: 1234)"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-lg tracking-widest text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1 text-xs">
                Vazgeç
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !pin}
                className="flex-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? 'Doğrulanıyor...' : 'Kilidi Aç'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
