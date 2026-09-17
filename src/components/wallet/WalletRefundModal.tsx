'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Coins,
  CreditCard,
} from 'lucide-react';
import { useWalletStore } from '@/stores/useWalletStore';
import { cn } from '@/lib/utils';
import { LIFEOS_CREDIT_RATE_KURUS, LIFEOS_CREDIT_RATE_TL } from '@/types/payment';

interface WalletRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletRefundModal({ isOpen, onClose }: WalletRefundModalProps) {
  const { wallet, requestRefund, isActionLoading } = useWalletStore();
  const [creditCount, setCreditCount] = useState<number>(20);
  const [reason, setReason] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Orijinal Kredi Kartı');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const purchased = wallet?.purchasedCredits || 0;
  const spent = wallet?.spentCredits || 0;
  const refunded = wallet?.refundedCredits || 0;
  const pending = wallet?.pendingRefundCredits || 0;

  // Maximum unused purchased credits eligible for refund
  const maxEligibleCredits = Math.max(0, purchased - spent - refunded - pending);
  const refundAmountTL = (creditCount * LIFEOS_CREDIT_RATE_TL).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (creditCount <= 0 || creditCount > maxEligibleCredits) {
      setError(`Geçerli bir kredi miktarı giriniz (En fazla ${maxEligibleCredits} Kredi).`);
      return;
    }

    if (!reason.trim()) {
      setError('Lütfen iade talebinizin nedenini kısaca açıklayınız.');
      return;
    }

    const res = await requestRefund(creditCount, reason.trim(), selectedMethod);
    if (res.success) {
      setSuccessMessage(res.message || 'İade talebiniz başarıyla oluşturuldu.');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setReason('');
      }, 1600);
    } else {
      setError(res.message || 'İade talebi oluşturulamadı.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/70 bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Kredi İadesi Talebi</h2>
                <p className="text-[11px] text-muted-foreground">Kullanılmamış Kredi İade Formu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {/* Legal Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Kredi İade Politikası</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Yalnızca satın alınıp hiç kullanılmamış krediler için iade talep edilebilir. İade,
                <strong> orijinal ödeme yönteminize</strong> yapılacaktır. Harcanmış veya promosyon
                krediler iade edilemez.
              </p>
            </div>

            {/* Eligible balance info */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">İade Edilebilir Krediniz:</span>
              <span className="font-bold text-foreground font-mono">
                {maxEligibleCredits} LifeOS Kredisi
              </span>
            </div>

            {/* Credit Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">İade Edilecek Kredi Adedi</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={maxEligibleCredits}
                  value={creditCount || ''}
                  onChange={(e) => setCreditCount(Math.min(maxEligibleCredits, Math.max(1, parseInt(e.target.value) || 0)))}
                  disabled={maxEligibleCredits <= 0}
                  className="flex-1 h-11 rounded-2xl border border-border bg-background px-3.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCreditCount(maxEligibleCredits)}
                  disabled={maxEligibleCredits <= 0}
                  className="h-11 px-3.5 rounded-2xl border border-border bg-muted/60 text-xs font-bold hover:bg-muted"
                >
                  Tümü
                </button>
              </div>
            </div>

            {/* Calculated Refund Value */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Birim İade Değeri:</span>
                <span className="font-mono font-bold text-foreground">1 Kredi = 1,35 TL</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2">
                <span className="font-bold text-foreground">Orijinal Yönteme Aktarılacak Tutar:</span>
                <span className="font-mono font-black text-sm text-primary">{refundAmountTL} TL</span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">İade Nedeni *</label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Örn: Yanlışlıkla fazla paket satın aldım, kredileri kullanmadım."
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">İade Kanalı</label>
              <div className="p-3 rounded-2xl border border-border bg-card flex items-center gap-2.5 text-xs">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Satın Alımda Kullanılan Orijinal Kart</span>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isActionLoading || maxEligibleCredits <= 0 || creditCount <= 0}
                className={cn(
                  'w-full h-11 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs',
                  maxEligibleCredits > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <RotateCcw className="h-4 w-4" />
                <span>{isActionLoading ? 'Talep İletiliyor...' : 'İade Talebini Gönder'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
