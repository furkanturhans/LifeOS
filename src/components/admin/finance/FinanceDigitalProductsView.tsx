'use client';

import React, { useEffect } from 'react';
import { BookOpen, DollarSign, DownloadCloud } from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat(getFormattingLocale(), {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function FinanceDigitalProductsView() {
  const localizeText = useLocaleRender();
  const { digitalProducts, fetchOverview } = useAdminFinanceStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{localizeText("Kitap ve Dijital Ürün Satış Gelirleri")}</h3>
            <p className="text-xs text-muted-foreground">{localizeText("Eğitmenlerin yayınladığı e-kitaplar ve dijital çalışma kaynaklarının finansal dökümü")}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">{localizeText("Ürün Adı & Yazar")}</th>
                <th className="p-3.5">{localizeText("Kategori")}</th>
                <th className="p-3.5 text-center">{localizeText("Satış Adedi")}</th>
                <th className="p-3.5 text-right">{localizeText("Brüt Hacim")}</th>
                <th className="p-3.5 text-right">{localizeText("LifeOS Payı (%20)")}</th>
                <th className="p-3.5 text-right">{localizeText("Yazar Neti (%80)")}</th>
                <th className="p-3.5 text-center">{localizeText("İadeler")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {digitalProducts.map((prod) => (
                <tr key={prod.productId} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-foreground text-xs">{localizeText(prod.title)}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{localizeText("Yazar: ")}{localizeText(prod.authorName)}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-muted-foreground">{localizeText(prod.category)}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-foreground">{localizeText(prod.salesCount)}</td>
                  <td className="p-3.5 text-right font-bold font-mono text-foreground">{localizeText(formatTL(prod.grossRevenueKurus))}</td>
                  <td className="p-3.5 text-right font-bold font-mono text-primary">
                    {localizeText(formatTL(prod.platformCommissionKurus))}
                  </td>
                  <td className="p-3.5 text-right font-black font-mono text-emerald-500">
                    {localizeText(formatTL(prod.authorNetKurus))}
                  </td>
                  <td className="p-3.5 text-center font-mono text-muted-foreground">{localizeText(prod.refundsCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
