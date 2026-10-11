'use client';

import React from 'react';
import {
  X,
  Coins,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useCheckoutStore } from '@/stores/useCheckoutStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LIFEOS_CREDIT_RATE_TL } from '@/types/payment';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat(getFormattingLocale(), {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function UniversalCheckoutModal() {
  const localizeText = useLocaleRender();
  const {
    isOpen,
    intent,
    selectedPaymentMethod,
    isCreatingIntent,
    isProcessing,
    error,
    receipt,
    closeCheckout,
    setSelectedPaymentMethod,
    processPayment,
  } = useCheckoutStore();

  const { wallet } = useWalletStore();

  if (!isOpen) return null;

  const creditBalance = wallet?.creditBalance || 0;
  const creditsRequired = intent?.creditsRequired || intent?.educationCreditsCost || 0;
  const totalAmountTL = (creditsRequired * LIFEOS_CREDIT_RATE_TL).toFixed(2);
  const isCreditSufficient = creditBalance >= creditsRequired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{localizeText("Güvenli Ödeme ve Onay")}</h3>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                <Lock className="h-3 w-3 text-emerald-500" />{localizeText("256-Bit Uçtan Uca Koruma")}</span>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Loading State */}
        {isCreatingIntent ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-semibold">{localizeText("Ödeme özeti hazırlanıyor...")}</span>
          </div>
        ) : receipt ? (
          /* Receipt State */
          <div className="py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-black text-foreground">{localizeText("İşlem Başarıyla Tamamlandı!")}</h4>
              <p className="text-xs text-muted-foreground max-w-xs">{localizeText("Ödemeniz güvenle alındı ve erişiminiz anında aktif edildi.")}</p>
            </div>

            {/* Receipt Card */}
            <div className="rounded-2xl bg-muted/40 border border-border/70 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-[11px] text-muted-foreground pb-2 border-b border-border/60">
                <span>{localizeText("İşlem Makbuz No:")}</span>
                <span className="font-mono font-bold text-foreground">{localizeText(receipt.transactionId)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{localizeText("Ürün / Hizmet:")}</span>
                <span className="font-bold text-foreground truncate max-w-[220px]">{localizeText(receipt.itemTitle)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{localizeText("Ödeme Yöntemi:")}</span>
                <span className="font-semibold text-foreground">{localizeText("LifeOS Kredisi")}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="font-bold text-foreground">{localizeText("Kullanılan Kredi:")}</span>
                <span className="font-black font-mono text-emerald-500 text-sm">
                  {localizeText(receipt.creditsPaid ? `${receipt.creditsPaid} LifeOS Kredisi` : formatTL(receipt.amountPaidKurus))}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/finance"
                onClick={closeCheckout}
                className="flex-1 py-2.5 rounded-xl border border-border text-center text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >{localizeText("Cüzdanıma Git")}</Link>

              <button
                onClick={closeCheckout}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
              >{localizeText("Tamam")}</button>
            </div>
          </div>
        ) : intent ? (
          /* Normal Checkout State */
          <div className="space-y-4">
            {/* Item Summary Card */}
            <div className="rounded-2xl bg-muted/40 border border-border/70 p-4 space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase font-mono tracking-wider">
                {localizeText(intent.sourceModule.replace('_', ' '))}
              </span>
              <h4 className="text-sm font-bold text-foreground">{localizeText(intent.referenceItemTitle)}</h4>

              {intent.sellerName && (
                <p className="text-[11px] text-muted-foreground">{localizeText("Sağlayıcı / Eğitmen:")}<span className="font-semibold text-foreground">{localizeText(intent.sellerName)}</span>
                </p>
              )}

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{localizeText("Gerekli Bakiye:")}</span>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-foreground block">
                    {localizeText(creditsRequired)}{localizeText(" LifeOS Kredisi")}</span>
                  <span className="text-[10px] text-muted-foreground">{localizeText("Yaklaşık: ")}{localizeText(totalAmountTL)}{localizeText(" TL (1 Kredi = 1,35 TL)")}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">{localizeText("Ödeme Yöntemi:")}</label>

              <div className="space-y-2">
                {/* 1. LifeOS Credits */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('lifeos_credits')}
                  className={cn(
                    'w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all',
                    selectedPaymentMethod === 'lifeos_credits' || selectedPaymentMethod === 'education_credits' || selectedPaymentMethod === 'wallet_cash'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border/70 bg-card hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{localizeText("LifeOS Kredisi")}</span>
                      <span className="text-[10px] text-muted-foreground">{localizeText("Cüzdanınızdaki Bakiye:")}<strong className="font-mono text-foreground">{localizeText(creditBalance)}{localizeText(" Kredi")}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-primary block">
                      -{localizeText(creditsRequired)}{localizeText(" Kredi")}</span>
                    {!isCreditSufficient && (
                      <span className="text-[10px] text-rose-500 font-bold">{localizeText("Yetersiz Kredi")}</span>
                    )}
                  </div>
                </button>

                {/* 2. Direct Card Gateway */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('gateway_card')}
                  className={cn(
                    'w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all',
                    selectedPaymentMethod === 'gateway_card'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border/70 bg-card hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{localizeText("Kredi / Banka Kartı")}</span>
                      <span className="text-[10px] text-muted-foreground">{localizeText("iyzico / PayTR Güvenli Ödeme")}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{localizeText("Kart İle Öde")}</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{localizeText(error)}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border/70 gap-3">
              <button
                type="button"
                onClick={closeCheckout}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >{localizeText("Vazgeç")}</button>

              <button
                type="button"
                onClick={processPayment}
                disabled={
                  isProcessing ||
                  ((selectedPaymentMethod === 'lifeos_credits' || selectedPaymentMethod === 'education_credits' || selectedPaymentMethod === 'wallet_cash') && !isCreditSufficient)
                }
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{localizeText("İşleniyor...")}</span>
                  </>
                ) : (
                  <>
                    <span>{localizeText(creditsRequired)}{localizeText(" Kredi ile Onayla")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
