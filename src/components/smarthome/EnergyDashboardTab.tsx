'use client';

import React from 'react';
import { Zap, TrendingDown, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

export function EnergyDashboardTab() {
  const { energy, home } = useSmartHomeStore();

  if (!home?.isBridgeConnected) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl p-6 space-y-2">
        <Zap className="h-8 w-8 mx-auto text-amber-500/50" />
        <p className="font-bold text-foreground">Enerji Verisi Alınamıyor</p>
        <p className="text-[11px] max-w-sm mx-auto">
          Enerji tüketimi ve tasarruf analizlerini görüntülemek için lütfen Home Assistant köprünüzü bağlayınız.
        </p>
      </div>
    );
  }

  const dailyKWh = energy?.totalDailyKWh || 0;
  const monthlyKWh = energy?.totalMonthlyKWh || 0;
  const monthlyCostTL = (energy?.estimatedMonthlyCostTL || 0).toFixed(2);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 select-none">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 rounded-3xl border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Bugünkü Tüketim</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground mt-1">
            {dailyKWh} <span className="text-xs font-normal text-muted-foreground">kWh</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Düne göre %12 daha az</p>
        </Card>

        <Card className="p-4 rounded-3xl border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Aylık Toplam Tüketim</span>
            <Zap className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground mt-1">
            {monthlyKWh} <span className="text-xs font-normal text-muted-foreground">kWh</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Cari ay tahmini</p>
        </Card>

        <Card className="p-4 rounded-3xl border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Tahmini Elektrik Faturası</span>
            <span className="text-xs font-bold text-primary font-mono">₺</span>
          </div>
          <div className="text-2xl font-black font-mono text-primary mt-1">
            {monthlyCostTL} <span className="text-xs font-normal text-muted-foreground">TL</span>
          </div>
          <p className="text-[10px] text-muted-foreground">2,85 TL/kWh standart tarife</p>
        </Card>
      </div>

      {/* Top Consumers List */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground">En Çok Enerji Tüketen Cihazlar</h3>
          <span className="text-[10px] text-muted-foreground font-semibold">Canlı Ölçüm</span>
        </div>

        <div className="space-y-2.5">
          {energy?.topConsumers.map((item) => (
            <div key={item.deviceId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{item.deviceName} ({item.room})</span>
                <span className="font-mono font-bold text-foreground">
                  {item.kwh} kWh (%{item.percentage})
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Eco Savings Recommendations */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>LifeOS Akıllı Enerji Tasarruf Önerileri</span>
        </div>
        <div className="space-y-1.5 pt-1 text-[11px] text-emerald-900/80 dark:text-emerald-200/90 leading-relaxed">
          {energy?.savingsRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
