'use client';

import React, { useEffect } from 'react';
import { Percent, ShieldCheck, History, Info, Layers } from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';

export function FinanceCommissionsView() {
  const { commissionRules, fetchCommissions } = useAdminFinanceStore();

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Sürümlü Komisyon & Gelir Modeli Kuralları</h3>
            <p className="text-xs text-muted-foreground">
              Her işlem tipine ve pazar yerine göre sunucu tarafında uygulanan resmi komisyon katsayıları
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commissionRules.map((rule) => {
          const providerShare = 100 - rule.commissionRatePercent;
          return (
            <div
              key={rule.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-2xs hover:border-border transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                    {rule.moduleKey}
                  </span>
                  <h4 className="text-xs font-bold text-foreground mt-2">{rule.titleTr}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {rule.descriptionTr}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-primary font-mono">
                    %{rule.commissionRatePercent}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground block">LifeOS Payı</span>
                </div>
              </div>

              {/* Share Distribution Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-primary">LifeOS: %{rule.commissionRatePercent}</span>
                  <span className="text-emerald-500">
                    {rule.commissionRatePercent === 100 ? 'Platform Ekosistem' : `Sağlayıcı / Eğitmen: %${providerShare}`}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${rule.commissionRatePercent}%` }}
                    className="bg-primary h-full"
                  />
                  <div
                    style={{ width: `${providerShare}%` }}
                    className="bg-emerald-500 h-full"
                  />
                </div>
                {rule.fixedFeeKurus && (
                  <div className="text-[10px] font-mono font-semibold text-amber-500 pt-1">
                    + {(rule.fixedFeeKurus / 100).toFixed(2)} TL Sabit İşlem Bedeli
                  </div>
                )}
              </div>

              {/* Version & Audit Footer */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Sürüm: v{rule.version}.0
                </span>
                <span>Yürürlük: {new Date(rule.effectiveFrom).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice Card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <span className="font-bold text-foreground block">Sıfır Hata Güvenliği (Zero-Float Precision):</span>
          <p className="leading-relaxed text-[11px]">
            Tüm komisyon kesintileri kuruş hassasiyetinde tamsayı aritmetiğiyle hesaplanır. İstemci tarafında hiçbir komisyon değişikliği yapılamaz, tüm oranlar sunucudaki değiştirilemez kural motoru tarafından yönetilir.
          </p>
        </div>
      </div>
    </div>
  );
}
