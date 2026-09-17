'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  Info,
} from 'lucide-react';
import { useWalletStore } from '@/stores/useWalletStore';
import { cn } from '@/lib/utils';
import { LIFEOS_CREDIT_RATE_TL, LIFEOS_CREDIT_RATE_KURUS } from '@/types/payment';

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PACKAGES = [
  { credits: 50, label: 'Başlangıç Paketi', badge: 'Popüler' },
  { credits: 100, label: 'Standart Paket', badge: 'Önerilen' },
  { credits: 250, label: 'Gelişmiş Paket', badge: 'Avantajlı' },
  { credits: 500, label: 'Pro & Akademi', badge: 'Maksimum' },
];

export function WalletTopupModal({ isOpen, onClose }: WalletTopupModalProps) {
  const { purchaseCredits, isActionLoading } = useWalletStore();
  const [selectedCredits, setSelectedCredits] = useState<number>(100);
  const [customCredits, setCustomCredits] = useState<string>('100');
  const [isCustom, setIsCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCreditCount = isCustom ? parseInt(customCredits) || 0 : selectedCredits;
  const totalAmountTL = (currentCreditCount * LIFEOS_CREDIT_RATE_TL).toFixed(2);

  const handleSelectPackage = (credits: number) => {
    setIsCustom(false);
    setSelectedCredits(credits);
    setCustomCredits(credits.toString());
  };

  const handleCustomChange = (val: string) => {
    setIsCustom(true);
    setCustomCredits(val);
  };

  const handlePurchase = async () => {
    setError(null);
    setSuccessMessage(null);

    if (currentCreditCount <= 0) {
      setError('Lütfen geçerli bir kredi miktarı giriniz.');
      return;
    }

    const res = await purchaseCredits(
      currentCreditCount,
      'gateway_card',
      `${currentCreditCount} LifeOS Kredisi Satın Alımı`
    );

    if (res.success) {
      setSuccessMessage(res.message || 'Kredileriniz cüzdanınıza başarıyla yüklendi!');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } else {
      setError(res.message || 'Kredi satın alma işlemi tamamlanamadı.');
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">LifeOS Kredisi Satın Al</h2>
                <p className="text-[11px] text-muted-foreground">Uygulama İçi Kullanım Bakiyesi</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Regulatory Closed-Loop Notice */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>LifeOS Kredisi Nedir?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                LifeOS Kredisi, uygulama içindeki seçili hizmet ve ürünlerde kullanılan kullanım
                bakiyesidir. Krediler kullanıcılar arasında transfer edilemez, nakde çevrilemez veya
                dışarıda kullanılamaz.
              </p>
            </div>

            {/* Rate Banner */}
            <div className="p-3 rounded-2xl bg-muted/50 border border-border/70 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Merkezi Kredi Birim Fiyatı:</span>
              <span className="font-mono font-bold text-primary">1 Kredi = 1,35 TL</span>
            </div>

            {/* Packages Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Kredi Paketleri</label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_PACKAGES.map((pkg) => {
                  const isSelected = !isCustom && selectedCredits === pkg.credits;
                  const price = (pkg.credits * LIFEOS_CREDIT_RATE_TL).toFixed(2);
                  return (
                    <button
                      key={pkg.credits}
                      type="button"
                      onClick={() => handleSelectPackage(pkg.credits)}
                      className={cn(
                        'relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                          : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {pkg.credits} Kredi
                        </span>
                        {pkg.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-primary/15 text-primary">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-primary font-mono">{price} TL</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Quantity Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Özel Kredi Miktarı</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={customCredits}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Örn: 150"
                  className={cn(
                    'flex-1 h-11 rounded-2xl border bg-background px-3.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none',
                    isCustom ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                  )}
                />
                <span className="text-xs font-semibold text-muted-foreground pr-1">Kredi</span>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Alınacak Kredi:</span>
                <span className="font-mono font-bold text-foreground">{currentCreditCount} Adet</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Birim Fiyat:</span>
                <span className="font-mono text-muted-foreground">1,35 TL (KDV Dahil)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2 font-bold">
                <span className="text-foreground">Toplam Ödenecek Tutar:</span>
                <span className="text-sm font-black font-mono text-primary">{totalAmountTL} TL</span>
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
                type="button"
                onClick={handlePurchase}
                disabled={isActionLoading || currentCreditCount <= 0}
                className="w-full h-11 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isActionLoading ? 'İşlem Yapılıyor...' : `${totalAmountTL} TL ile Satın Al`}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
