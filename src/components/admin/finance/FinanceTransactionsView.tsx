'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Eye,
  X,
  Building,
  Receipt,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';
import type { FinanceSourceModule, TransactionStatus, FinancialTransaction } from '@/types/finance';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat(getFormattingLocale(), {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

const MODULE_FILTERS: { id: FinanceSourceModule | 'all'; label: string }[] = [
  { id: 'all', label: 'Tüm Modüller' },
  { id: 'education_course', label: 'Online Kurs' },
  { id: 'education_live', label: 'Canlı Ders (BBB)' },
  { id: 'education_book', label: 'Kitap & Dijital' },
  { id: 'service_moving', label: 'Nakliye' },
  { id: 'service_taxi', label: 'Taksi' },
  { id: 'service_craftsman', label: 'Usta' },
  { id: 'service_travel', label: 'Seyahat' },
  { id: 'subscription', label: 'Abonelik' },
];

const STATUS_FILTERS: { id: TransactionStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tüm Durumlar' },
  { id: 'succeeded', label: 'Başarılı' },
  { id: 'pending', label: 'Beklemede' },
  { id: 'refunded', label: 'İade Edildi' },
  { id: 'failed', label: 'Başarısız' },
];

export function FinanceTransactionsView() {
  const localizeText = useLocaleRender();
  const {
    transactions,
    sourceFilter,
    statusFilter,
    searchQuery,
    setSourceFilter,
    setStatusFilter,
    setSearchQuery,
    fetchTransactions,
  } = useAdminFinanceStore();

  const [selectedTx, setSelectedTx] = useState<FinancialTransaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'succeeded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="h-3 w-3" />{localizeText("Başarılı")}</span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />{localizeText("Beklemede")}</span>
        );
      case 'refunded':
      case 'partially_refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
            <RotateCcw className="h-3 w-3" />{localizeText("İade Edildi")}</span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            <XCircle className="h-3 w-3" /> {localizeText(status)}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border/70 p-4 rounded-2xl shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={localizeText("İşlem No, Eğitmen, Müşteri veya Ürün Ara...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Module Select */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden"
          >
            {MODULE_FILTERS.map((m) => (
              <option key={m.id} value={m.id}>
                {localizeText(m.label)}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>
                {localizeText(s.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">{localizeText("İşlem Kodu & Tarih")}</th>
                <th className="p-3.5">{localizeText("Hizmet / Referans")}</th>
                <th className="p-3.5">{localizeText("Satıcı / Sağlayıcı")}</th>
                <th className="p-3.5 text-right">{localizeText("Brüt Tutar")}</th>
                <th className="p-3.5 text-center">{localizeText("Komisyon %")}</th>
                <th className="p-3.5 text-right">{localizeText("LifeOS Payı")}</th>
                <th className="p-3.5 text-right">{localizeText("Sağlayıcı Neti")}</th>
                <th className="p-3.5 text-center">{localizeText("Durum")}</th>
                <th className="p-3.5 text-center">{localizeText("Detay")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">{localizeText("Kriterlere uygun finansal işlem kaydı bulunamadı.")}</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-foreground text-xs">{localizeText(tx.id)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {localizeText(new Date(tx.timestamp).toLocaleString(getFormattingLocale()))}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-[200px]">
                      <span className="font-semibold text-foreground block truncate" title={localizeText(tx.referenceItemTitle)}>
                        {localizeText(tx.referenceItemTitle)}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize font-mono">
                        {localizeText(tx.sourceModule.replace('_', ' '))}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground block truncate">
                        {localizeText(tx.sellerName || 'LifeOS Platform')}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{localizeText("Alıcı: ")}{localizeText(tx.buyerMaskedId)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold font-mono text-foreground">
                      {localizeText(formatTL(tx.grossAmountKurus))}
                    </td>
                    <td className="p-3.5 text-center font-bold text-muted-foreground">
                      %{localizeText(tx.platformCommissionRatePercent)}
                    </td>
                    <td className="p-3.5 text-right font-bold font-mono text-emerald-500">
                      {localizeText(formatTL(tx.platformCommissionKurus))}
                    </td>
                    <td className="p-3.5 text-right font-semibold font-mono text-muted-foreground">
                      {localizeText(formatTL(tx.sellerNetKurus))}
                    </td>
                    <td className="p-3.5 text-center">{localizeText(getStatusBadge(tx.status))}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg border border-border/70 hover:bg-muted hover:text-primary transition-colors text-muted-foreground"
                        title={localizeText("İşlem Detayını Görüntüle")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">{localizeText("Finansal İşlem Ayrıntısı")}</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-semibold">{localizeText("İşlem Kimliği (ID):")}</span>
                <span className="font-mono font-bold text-foreground">{localizeText(selectedTx.id)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground font-semibold">{localizeText("Tarih & Saat:")}</span>
                <span className="font-mono text-foreground">
                  {localizeText(new Date(selectedTx.timestamp).toLocaleString(getFormattingLocale()))}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/70 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{localizeText("Brüt Tahsilat Tutarı:")}</span>
                  <span className="font-mono font-bold text-foreground">{localizeText(formatTL(selectedTx.grossAmountKurus))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{localizeText("Platform Komisyon Oranı:")}</span>
                  <span className="font-bold text-foreground">%{localizeText(selectedTx.platformCommissionRatePercent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{localizeText("LifeOS Komisyon Payı:")}</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {localizeText(formatTL(selectedTx.platformCommissionKurus))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{localizeText("Tahmini Ağ / Banka Kesintisi:")}</span>
                  <span className="font-mono text-rose-500">
                    -{localizeText(formatTL(selectedTx.gatewayFeeKurus))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-bold text-foreground">{localizeText("LifeOS Net Kâr:")}</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {localizeText(formatTL(selectedTx.platformNetKurus))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed border-border pt-2">
                  <span className="text-muted-foreground">{localizeText("Satıcı / Sağlayıcı Hakediş Neti:")}</span>
                  <span className="font-mono font-bold text-foreground">
                    {localizeText(formatTL(selectedTx.sellerNetKurus))}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                <div className="text-muted-foreground font-semibold">{localizeText("Denetim Notu & Güvenlik:")}</div>
                <div className="text-foreground text-[11px]">{localizeText(selectedTx.auditNote || 'Ek denetim notu bulunmuyor.')}</div>
                {selectedTx.idempotencyKey && (
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">{localizeText("Idempotency Key: ")}{localizeText(selectedTx.idempotencyKey)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90"
              >{localizeText("Kapat")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
