'use client';

import React, { useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Clock,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';
import type { TimeFilterOption } from '@/types/finance';

const TIME_FILTERS: { id: TimeFilterOption; label: string }[] = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7_days', label: 'Son 7 Gün' },
  { id: 'last_30_days', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' },
  { id: 'custom', label: 'Tüm Zamanlar' },
];

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function FinanceOverviewView() {
  const { metrics, timeFilter, setTimeFilter, fetchOverview, isLoading } = useAdminFinanceStore();
  const [creditMetrics, setCreditMetrics] = React.useState<any>(null);

  const fetchCreditData = async () => {
    try {
      const res = await fetch(`/api/admin/finance/credits?timeFilter=${timeFilter}`);
      const data = await res.json();
      if (data.success) {
        setCreditMetrics(data.metrics);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchCreditData();
  }, [fetchOverview, timeFilter]);

  if (isLoading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-semibold">Finansal veriler hesaplanıyor...</span>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Toplam Brüt İşlem Hacmi',
      value: formatTL(metrics?.totalGrossVolumeKurus || 0),
      subtitle: 'Tüm ekosistem satış cirosu',
      icon: DollarSign,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      trend: '+18.4%',
      isPositive: true,
    },
    {
      title: 'LifeOS Net Platform Geliri',
      value: formatTL(metrics?.platformNetRevenueKurus || 0),
      subtitle: 'Komisyon & kesintiler sonrası net kâr',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      trend: '+24.1%',
      isPositive: true,
    },
    {
      title: 'Bekleyen Tahsilatlar',
      value: formatTL(metrics?.pendingReceivablesKurus || 0),
      subtitle: 'Provizyon / işlem onayı bekleyen',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      trend: 'Normal',
      isPositive: true,
    },
    {
      title: 'Bekleyen Hakediş Ödemeleri',
      value: formatTL(metrics?.pendingPayoutsKurus || 0),
      subtitle: 'Eğitmen & sağlayıcı ödenecek hakediş',
      icon: Wallet,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      trend: 'Planlandı',
      isPositive: true,
    },
    {
      title: 'Tamamlanan İadeler',
      value: formatTL(metrics?.completedRefundsKurus || 0),
      subtitle: 'İade ve telafi tutarları',
      icon: RotateCcw,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      trend: '-1.2%',
      isPositive: true,
    },
    {
      title: 'Aylık Düzenli Gelir (MRR)',
      value: formatTL(metrics?.activeSubscriptionMrrKurus || 0),
      subtitle: 'LifeOS Plus aktif abonelikleri',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      trend: '+12.6%',
      isPositive: true,
    },
    {
      title: "Bugünün Platform Neti",
      value: formatTL(metrics?.todayRevenueKurus || 0),
      subtitle: 'Günlük anlık net komisyon',
      icon: Calendar,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      trend: 'Canlı',
      isPositive: true,
    },
    {
      title: "Bu Ayın Platform Neti",
      value: formatTL(metrics?.thisMonthRevenueKurus || 0),
      subtitle: 'Cari ay gerçekleşen platform payı',
      icon: Layers,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      trend: 'Hedef %112',
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Time Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/70 border border-border/80 p-3 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Dönem Filtresi:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150',
                timeFilter === filter.id
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-2xs hover:border-border transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', kpi.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {kpi.isPositive ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                  {kpi.trend}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                  {kpi.title}
                </span>
                <div className="text-lg font-black tracking-tight text-foreground mt-0.5">
                  {kpi.value}
                </div>
                <span className="text-[10px] text-muted-foreground/80 block mt-1 truncate">
                  {kpi.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* LifeOS Kredisi Ekosistem & Yükümlülük Raporu */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-lg font-bold">
              🪙
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">LifeOS Kredisi Ekosistem & Yükümlülük Özeti</h3>
              <p className="text-[11px] text-muted-foreground">
                Uygulama içi kapalı devre kullanım kredisi, dolaşımdaki bakiye ve hizmet yükümlülüğü
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono">
            1 Kredi = 1,35 TL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground block font-semibold">Toplam Satılan Kredi</span>
            <div className="text-base font-black text-foreground font-mono mt-0.5">
              {creditMetrics?.totalSoldCredits || 0} <span className="text-xs font-normal text-muted-foreground">Kredi</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">
              {formatTL(creditMetrics?.totalSoldKurus || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground block font-semibold">Aktif Kullanıcı Bakiyeleri</span>
            <div className="text-base font-black text-foreground font-mono mt-0.5">
              {creditMetrics?.totalActiveUserCredits || 0} <span className="text-xs font-normal text-muted-foreground">Kredi</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Dolaşımdaki toplam</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[10px] text-muted-foreground block font-semibold">Toplam Harcanan Kredi</span>
            <div className="text-base font-black text-foreground font-mono mt-0.5">
              {creditMetrics?.totalSpentCredits || 0} <span className="text-xs font-normal text-muted-foreground">Kredi</span>
            </div>
            <span className="text-[10px] text-primary font-mono font-semibold">Hizmet & eğitim tüketimi</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">Kullanılmamış Kredi Yükümlülüğü</span>
            <div className="text-base font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
              {formatTL(creditMetrics?.unearnedCreditLiabilityKurus || 0)}
            </div>
            <span className="text-[10px] text-amber-600/80 block">Bilanço ertelenmiş gelir payı</span>
          </div>
        </div>

        {/* Module breakdown row */}
        {creditMetrics?.moduleBreakdown && creditMetrics.moduleBreakdown.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <span className="text-[11px] font-bold text-muted-foreground block mb-2">Modül Bazlı Kredi Harcamaları:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {creditMetrics.moduleBreakdown.map((mb: any) => (
                <div key={mb.module} className="p-2 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px] truncate max-w-[110px]">{mb.labelTr}</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">{mb.creditsSpent} Kredi</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts & Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hourly Trend (Today) */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground">Günün Saatlik Gelir Akışı</h3>
              <p className="text-[11px] text-muted-foreground">Bugün gerçekleşen saatlik işlem hacmi</p>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Canlı Saatlik
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-4 border-b border-border/50 pb-2">
            {metrics?.hourlyRevenueToday.map((item, index) => {
              const maxGross = Math.max(...(metrics.hourlyRevenueToday.map((m) => m.grossKurus) || [1]));
              const heightPercent = Math.max(12, Math.round((item.grossKurus / maxGross) * 100));
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary/90 transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10 pointer-events-none transition-opacity">
                        {formatTL(item.grossKurus)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 12 Months Performance */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground">Aylık Platform Gelir Trendi</h3>
              <p className="text-[11px] text-muted-foreground">Son aylardaki brüt hacim ve net komisyon performansı</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Sürekli Büyüme
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {metrics?.last12MonthsTrend.map((m, index) => {
              const maxGross = 1000000;
              const grossPercent = Math.min(100, Math.round((m.grossKurus / maxGross) * 100));
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground">{m.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono">Brüt: {formatTL(m.grossKurus)}</span>
                      <span className="font-bold text-emerald-500 font-mono">Net: {formatTL(m.platformNetKurus)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${grossPercent}%` }}
                      className="bg-gradient-to-r from-primary to-emerald-500 rounded-full h-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue Source Breakdown Table */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Gelir Kaynaklarına Göre Dağılım</h3>
            <p className="text-[11px] text-muted-foreground">Her modülün ürettiği brüt ciro ve LifeOS komisyon tutarları</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 text-muted-foreground text-[11px]">
                <th className="pb-2.5 font-bold">Gelir Kaynağı / Modül</th>
                <th className="pb-2.5 font-bold text-center">İşlem Adedi</th>
                <th className="pb-2.5 font-bold text-right">Toplam Brüt Hacim</th>
                <th className="pb-2.5 font-bold text-right">LifeOS Net Komisyon</th>
                <th className="pb-2.5 font-bold text-right">Pay Oranı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {metrics?.sourceBreakdown.map((sb, idx) => {
                const sharePercent =
                  metrics.totalGrossVolumeKurus > 0
                    ? ((sb.grossKurus / metrics.totalGrossVolumeKurus) * 100).toFixed(1)
                    : '0.0';
                return (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {sb.labelTr}
                    </td>
                    <td className="py-3 text-center text-muted-foreground font-mono">{sb.transactionCount}</td>
                    <td className="py-3 text-right font-bold font-mono text-foreground">{formatTL(sb.grossKurus)}</td>
                    <td className="py-3 text-right font-black font-mono text-emerald-500">{formatTL(sb.platformNetKurus)}</td>
                    <td className="py-3 text-right font-semibold text-muted-foreground">%{sharePercent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Earners Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Instructors */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold text-foreground">En Çok Kazanan Eğitmenler</h3>
          </div>
          <div className="space-y-2 pt-1">
            {metrics?.topInstructors.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{inst.name}</span>
                    <span className="text-[10px] text-muted-foreground">{inst.salesCount} Satış / Canlı Ders</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-foreground block font-mono">{formatTL(inst.grossKurus)}</span>
                  <span className="text-[10px] font-semibold text-emerald-500 font-mono">Platform: {formatTL(inst.platformCommissionKurus)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Providers */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-sky-500" />
            <h3 className="text-xs font-bold text-foreground">En Çok Kazanan Hizmet Sağlayıcılar</h3>
          </div>
          <div className="space-y-2 pt-1">
            {metrics?.topProviders.map((prov) => (
              <div key={prov.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 font-bold text-xs">
                    🛠️
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{prov.name}</span>
                    <span className="text-[10px] text-muted-foreground">{prov.serviceType} • {prov.jobsCount} Hizmet</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-foreground block font-mono">{formatTL(prov.grossKurus)}</span>
                  <span className="text-[10px] font-semibold text-emerald-500 font-mono">Platform: {formatTL(prov.commissionKurus)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
