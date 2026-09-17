'use client';

import React, { useEffect, useState } from 'react';
import {
  Coins,
  Plus,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Eye,
  Car,
  Truck,
  Wrench,
  Gamepad2,
  GraduationCap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WalletTopupModal } from './WalletTopupModal';
import { WalletRefundModal } from './WalletRefundModal';
import { useWalletStore } from '@/stores/useWalletStore';
import type { CreditLedgerEntry, CreditRefundRequest } from '@/types/payment';
import { cn } from '@/lib/utils';
import { LIFEOS_CREDIT_RATE_TL } from '@/types/payment';

export function WalletDashboardView() {
  const { wallet, ledger, refundRequests, creditRate, serviceRules, fetchWallet, isLoading } =
    useWalletStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'refunds' | 'rules'>('ledger');
  const [filterType, setFilterType] = useState<string>('all');
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<CreditLedgerEntry | null>(null);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const filteredLedger = ledger.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const creditBalance = wallet?.creditBalance || 0;
  const purchasedCredits = wallet?.purchasedCredits || 0;
  const promoCredits = wallet?.promoCredits || 0;
  const spentCredits = wallet?.spentCredits || 0;
  const refundedCredits = wallet?.refundedCredits || 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Legal / Definition Notice Banner */}
      <div className="flex items-center gap-3 p-4 rounded-3xl bg-card border border-border/80 shadow-xs select-none">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xl font-bold">
          🪙
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground">LifeOS Kredisi</h4>
          <p className="text-[11px] text-muted-foreground leading-snug">
            LifeOS Kredisi, uygulama içindeki seçili hizmet ve ürünlerde kullanılan kullanım
            bakiyesidir. Krediler kullanıcılar arasında transfer edilemez veya nakde çevrilemez.
          </p>
        </div>
      </div>

      {/* 2. Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-black p-6 text-white border border-border/60 shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/70 text-xs font-semibold">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>Mevcut Kullanılabilir Bakiye</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {creditBalance}
              </span>
              <span className="text-sm font-bold text-amber-400">LifeOS Kredisi</span>
            </div>
            <p className="text-[11px] text-white/60">
              Yaklaşık Değer: {(creditBalance * LIFEOS_CREDIT_RATE_TL).toFixed(2)} TL (1 Kredi = 1,35 TL)
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsTopupModalOpen(true)}
              className="flex-1 sm:flex-none h-11 px-4 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Kredi Satın Al</span>
            </button>

            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="flex-1 sm:flex-none h-11 px-4 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>Kredi İadesi Talebi</span>
            </button>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-white/60 block text-[11px]">Satın Alınan</span>
            <span className="font-mono font-bold text-white">{purchasedCredits} Kredi</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">Promosyon / Bonus</span>
            <span className="font-mono font-bold text-amber-300">{promoCredits} Kredi</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">Toplam Harcanan</span>
            <span className="font-mono font-bold text-white">{spentCredits} Kredi</span>
          </div>
          <div>
            <span className="text-white/60 block text-[11px]">İade Edilen</span>
            <span className="font-mono font-bold text-rose-300">{refundedCredits} Kredi</span>
          </div>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/70 gap-1 select-none">
        <button
          onClick={() => setActiveTab('ledger')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeTab === 'ledger'
              ? 'bg-card text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Kredi Hareketleri ({ledger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeTab === 'refunds'
              ? 'bg-card text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>İade Talepleri ({refundRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeTab === 'rules'
              ? 'bg-card text-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Info className="h-3.5 w-3.5" />
          <span>Kullanım Kuralları</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      {/* TAB 1: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', label: 'Tüm Hareketler' },
              { id: 'purchased', label: 'Satın Alımlar' },
              { id: 'spent', label: 'Harcamalar' },
              { id: 'promo', label: 'Promosyonlar' },
              { id: 'refund', label: 'İadeler' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px]',
                  filterType === f.id
                    ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                    : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ledger Table */}
          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                    <th className="p-3.5">Tür & Tarih</th>
                    <th className="p-3.5">Açıklama / Modül</th>
                    <th className="p-3.5 text-right">Kredi Değişimi</th>
                    <th className="p-3.5 text-right">TL Değeri</th>
                    <th className="p-3.5 text-right">Kalan Bakiye</th>
                    <th className="p-3.5 text-center">İncele</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                        Bu filtreye uygun kredi hareketi bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((item) => {
                      const isPositive = item.creditAmount > 0;
                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs',
                                  isPositive
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-rose-500/10 text-rose-600'
                                )}
                              >
                                {isPositive ? (
                                  <ArrowDownLeft className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-foreground block">
                                  {item.type === 'purchased'
                                    ? 'Kredi Satın Alımı'
                                    : item.type === 'promo'
                                    ? 'Promosyon / Bonus'
                                    : item.type === 'spent'
                                    ? 'Hizmet / Ürün Harcaması'
                                    : item.type === 'refund'
                                    ? 'Kredi İadesi'
                                    : 'Yönetici Düzeltmesi'}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleString('tr-TR')}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 max-w-[220px]">
                            <span className="font-semibold text-foreground block truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate">
                              {item.description}
                            </span>
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold">
                            <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                              {isPositive ? `+${item.creditAmount}` : item.creditAmount} Kredi
                            </span>
                          </td>

                          <td className="p-3.5 text-right font-mono text-muted-foreground text-[11px]">
                            {(Math.abs(item.creditAmount) * LIFEOS_CREDIT_RATE_TL).toFixed(2)} TL
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-foreground">
                            {item.creditBalanceAfter} Kredi
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedLedgerItem(item)}
                              className="h-7 w-7 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground mx-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFUND REQUESTS */}
      {activeTab === 'refunds' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground">Kullanılmamış Kredi İade Talepleri</h3>
                <p className="text-[11px] text-muted-foreground">
                  Yalnızca satın alınıp hiç kullanılmamış krediler için orijinal ödeme kanalına iade süreci
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefundModalOpen(true)}
                className="text-xs font-bold h-8"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Yeni İade Talebi
              </Button>
            </div>

            {refundRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                Henüz kayıtlı bir iade talebiniz bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {refundRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-mono">{req.id}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold',
                            req.status === 'approved' || req.status === 'processed'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-600'
                              : 'bg-amber-500/15 text-amber-600'
                          )}
                        >
                          {req.status === 'approved' || req.status === 'processed'
                            ? 'Onaylandı & İade Edildi'
                            : req.status === 'rejected'
                            ? 'Reddedildi'
                            : 'İncelemede'}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{req.reason}</p>
                      <span className="text-[10px] text-muted-foreground">
                        Kanal: {req.originalPaymentMethod} • {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-foreground">{req.creditAmount} Kredi</div>
                      <div className="text-[11px] text-primary font-bold">
                        {(req.refundAmountKurus / 100).toFixed(2)} TL
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RULES & SERVICE CREDIT MODEL */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Taxi Rule Card */}
            <Card className="p-4 border-border bg-card shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Taksi Hizmet Modeli</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">10 Kredi / Yolculuk</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Yolcu taksi ücretini doğrudan taksiciye nakit öder. LifeOS yolcudan para kesmez.
                Taksici, tamamlanan yolculuk başına <strong>10 LifeOS Kredisi (13,50 TL)</strong> platform kullanım bedeli harcar.
              </p>
            </Card>

            {/* Moving Rule Card */}
            <Card className="p-4 border-border bg-card shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Nakliye Hizmet Modeli</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">50 Kredi / İş Başı</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Müşteri ile nakliye firması taşınma bedelini kendi aralarında öder. Firma, tamamlanan
                iş başına <strong>50 LifeOS Kredisi (67,50 TL)</strong> platform bedeli harcar.
              </p>
            </Card>

            {/* Craftsman Rule Card */}
            <Card className="p-4 border-border bg-card shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Usta & Tamirat Modeli</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">25 Kredi / Eşleşme</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Usta doğrudan iş bedelini tahsil eder. LifeOS, tamamlanan iş veya eşleşme başına
                <strong> 25 LifeOS Kredisi (33,75 TL)</strong> düşer.
              </p>
            </Card>

            {/* Education Rule Card */}
            <Card className="p-4 border-border bg-card shadow-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 font-bold">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Eğitim & Canlı Ders</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">50 Kredi / Canlı Ders</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Öğrenci canlı derse <strong>50 LifeOS Kredisi</strong> ile kaydolur. Eğitmen için
                ayrı TL hakediş kaydı (%70 pay) otomatik oluşturulur.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <WalletTopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
      <WalletRefundModal isOpen={isRefundModalOpen} onClose={() => setIsRefundModalOpen(false)} />

      {/* Item Details Modal */}
      {selectedLedgerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <span className="font-bold text-sm text-foreground">Kredi Hareketi Detayı</span>
              <button
                onClick={() => setSelectedLedgerItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">İşlem Kodu:</span>
                <span className="font-mono font-bold text-foreground">{selectedLedgerItem.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Başlık:</span>
                <span className="font-semibold text-foreground">{selectedLedgerItem.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Miktar:</span>
                <span className="font-mono font-bold text-primary">
                  {selectedLedgerItem.creditAmount} LifeOS Kredisi
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">TL Karşılığı:</span>
                <span className="font-mono font-bold text-foreground">
                  {(Math.abs(selectedLedgerItem.creditAmount) * LIFEOS_CREDIT_RATE_TL).toFixed(2)} TL
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Tarih:</span>
                <span className="text-foreground">
                  {new Date(selectedLedgerItem.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              {selectedLedgerItem.auditNote && (
                <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground italic">
                  Denetim Notu: {selectedLedgerItem.auditNote}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLedgerItem(null)}
              className="w-full text-xs font-bold"
            >
              Kapat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
