'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  RefreshCw,
} from 'lucide-react';
import type { ProviderEarningsSummary } from '@/types/payment';
import { cn } from '@/lib/utils';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function InstructorEarningsTab({ instructorId = 'usr-instructor-ahmet' }: { instructorId?: string }) {
  const [data, setData] = useState<ProviderEarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEarnings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/provider/earnings?providerId=${instructorId}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData.earnings);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEarnings();
  }, [instructorId]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs font-semibold">Kazanç ve hakediş verileri hesaplanıyor...</span>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Toplam Brüt Satış Hacmi',
      value: formatTL(data?.totalGrossKurus || 0),
      subtitle: 'Kurs & Canlı Ders Brüt Tutarı',
      icon: DollarSign,
      color: 'text-sky-500 bg-sky-500/10',
    },
    {
      title: 'LifeOS Platform Kesintisi',
      value: formatTL(data?.platformCommissionKurus || 0),
      subtitle: '%30 Platform Hizmet Bedeli',
      icon: TrendingUp,
      color: 'text-primary bg-primary/10',
    },
    {
      title: 'Ödenmeye Hazır Hakediş',
      value: formatTL(data?.readyToPayKurus || 0),
      subtitle: 'Mutabakat bekleyen net kazanç',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Toplam Ödenen Hakediş',
      value: formatTL(data?.paidKurus || 0),
      subtitle: 'Banka hesabına aktarılan tutar',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Eğitmen Kazançlarım ve Hakediş Takibi</h3>
            <p className="text-xs text-muted-foreground">
              Yayınlanan video kurslarınız ve canlı ders katılımlarınızdan elde edilen net gelirler
            </p>
          </div>
        </div>

        <button
          onClick={fetchEarnings}
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Yenile"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', kpi.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                  {kpi.title}
                </span>
                <div className="text-xl font-black font-mono text-foreground mt-0.5">
                  {kpi.value}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block truncate">
                  {kpi.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/70 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground">Satış ve Katılım Dökümü</h4>
          <span className="text-[10px] font-mono text-muted-foreground">
            {data?.recentTransactions.length || 0} Gerçekleşen Satış
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">Tarih & Kod</th>
                <th className="p-3.5">Kurs / Canlı Ders Adı</th>
                <th className="p-3.5">Öğrenci (Maskeli)</th>
                <th className="p-3.5 text-right">Brüt Tutar</th>
                <th className="p-3.5 text-right">LifeOS Komisyonu (%30)</th>
                <th className="p-3.5 text-right">Eğitmen Net Kazancı (%70)</th>
                <th className="p-3.5 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    Henüz kayıtlı bir satış hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-foreground text-xs">{tx.id}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-foreground max-w-[200px] truncate">
                      {tx.itemTitle}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{tx.customerMaskedId}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-foreground">
                      {formatTL(tx.grossKurus)}
                    </td>
                    <td className="p-3.5 text-right font-bold font-mono text-primary">
                      {formatTL(tx.commissionKurus)}
                    </td>
                    <td className="p-3.5 text-right font-black font-mono text-emerald-500">
                      {formatTL(tx.netEarningsKurus)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {tx.status === 'succeeded' ? 'Onaylandı' : tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
