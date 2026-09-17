'use client';

import React, { useEffect } from 'react';
import {
  Sparkles,
  Users,
  TrendingUp,
  UserPlus,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function FinanceSubscriptionsView() {
  const { subscriptionMetrics, fetchOverview } = useAdminFinanceStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const metrics = subscriptionMetrics;

  const cards = [
    {
      title: 'Toplam Aylık Düzenli Gelir (MRR)',
      value: formatTL(metrics?.totalMrrKurus || 0),
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      subtitle: 'Tahsil edilen aylık yinelenen ciro',
    },
    {
      title: 'Aktif Abone Sayısı',
      value: metrics?.activeSubscriptionsCount || 0,
      icon: Users,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      subtitle: 'Bireysel ve aile planları toplamı',
    },
    {
      title: 'Bu Ay Yeni Kayıtlar',
      value: `+${metrics?.newSubscriptionsThisMonth || 0}`,
      icon: UserPlus,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      subtitle: 'Son 30 günde başlayan üyeler',
    },
    {
      title: 'Deneme ➔ Ücretli Dönüşüm',
      value: `%${metrics?.trialConversionRatePercent || 0}`,
      icon: CheckCircle2,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      subtitle: 'Ücretsiz deneme sonrası üye kalma',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', c.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                  {c.title}
                </span>
                <div className="text-xl font-black text-foreground mt-0.5">{c.value}</div>
                <span className="text-[10px] text-muted-foreground mt-1 block">{c.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Plans Table */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Paket Bazlı MRR Dağılımı</h3>
            <p className="text-[11px] text-muted-foreground">Aktif abonelik katmanları ve churn oranları</p>
          </div>
          <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
            Otomatik Tahsilat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 text-muted-foreground text-[11px]">
                <th className="pb-2.5 font-bold">Paket Adı</th>
                <th className="pb-2.5 font-bold text-center">Aktif Abone</th>
                <th className="pb-2.5 font-bold text-right">Birim Fiyat</th>
                <th className="pb-2.5 font-bold text-right">Aylık Hacim (MRR)</th>
                <th className="pb-2.5 font-bold text-center">Churn (Kayıp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {metrics?.plans.map((p) => (
                <tr key={p.planId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    {p.planName}
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-foreground">{p.activeCount}</td>
                  <td className="py-3 text-right font-mono text-muted-foreground">{formatTL(p.monthlyPriceKurus)} / ay</td>
                  <td className="py-3 text-right font-bold font-mono text-emerald-500">{formatTL(p.mrrKurus)}</td>
                  <td className="py-3 text-center font-semibold text-muted-foreground">%{p.churnRatePercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
