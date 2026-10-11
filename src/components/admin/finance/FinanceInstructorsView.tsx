'use client';

import React, { useEffect } from 'react';
import { GraduationCap, DollarSign, Wallet, Video, BookOpen } from 'lucide-react';
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

export function FinanceInstructorsView() {
  const localizeText = useLocaleRender();
  const { metrics, fetchOverview } = useAdminFinanceStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Overview */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{localizeText("Eğitmen Kazançları & Canlı Sınıf Finansı")}</h3>
            <p className="text-xs text-muted-foreground">{localizeText("Doğrulanmış eğitmenlerin kurs satışları, BBB canlı ders katılımları ve hakediş dökümü")}</p>
          </div>
        </div>
      </div>

      {/* Instructor List */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/70 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground">{localizeText("Eğitmen Gelir Tablosu")}</h4>
          <span className="text-[10px] text-muted-foreground font-mono">
            {localizeText(metrics?.topInstructors.length || 0)}{localizeText(" Aktif Gelir Üreten Eğitmen")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">{localizeText("Eğitmen Adı & Kimliği")}</th>
                <th className="p-3.5 text-center">{localizeText("Satış / Katılım")}</th>
                <th className="p-3.5 text-right">{localizeText("Toplam Brüt Satış")}</th>
                <th className="p-3.5 text-right">{localizeText("LifeOS Komisyonu (%30)")}</th>
                <th className="p-3.5 text-right">{localizeText("Eğitmen Net Kazancı (%70)")}</th>
                <th className="p-3.5 text-center">{localizeText("Hakediş Durumu")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {metrics?.topInstructors.map((inst) => {
                const instructorNet = inst.grossKurus - inst.platformCommissionKurus;
                return (
                  <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                          🎓
                        </span>
                        {localizeText(inst.name)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono pl-8">{localizeText(inst.id)}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-foreground">{localizeText(inst.salesCount)}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-foreground">{localizeText(formatTL(inst.grossKurus))}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-primary">
                      {localizeText(formatTL(inst.platformCommissionKurus))}
                    </td>
                    <td className="p-3.5 text-right font-black font-mono text-emerald-500">
                      {localizeText(formatTL(instructorNet))}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">{localizeText("Ödeme Planlandı")}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
