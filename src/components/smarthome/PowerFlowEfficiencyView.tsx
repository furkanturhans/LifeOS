'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Sun,
  Flame,
  BatteryCharging,
  TrendingUp,
  Leaf,
  ShieldCheck,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

export function PowerFlowEfficiencyView() {
  const { energyFlow, solar, heatPump } = useSmartHomeStore();

  if (!energyFlow) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Canlı güç ve enerji verimliliği verisi yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Real-time Power & Eco Score Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Anlık Ev Elektrik Yükü (Canlı kW)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {energyFlow.homeConsumptionKW.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-muted-foreground">kW</span>
              <span className="ml-2 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/30">
                %{energyFlow.selfConsumptionPercent} Güneşle Karşılanıyor
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Çatı Solar Üretimi: <strong className="text-amber-500">{energyFlow.solarProductionKW.toFixed(2)} kW</strong> • Batarya Şarj: <strong className="text-emerald-500">{energyFlow.batteryPowerKW.toFixed(2)} kW</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/60 p-3.5 rounded-2xl border border-border/80">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-xl shadow-md">
              A+++
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground">Enerji Verimlilik Puanı</span>
              <div className="text-lg font-black text-foreground">
                {energyFlow.efficiencyScore} <span className="text-xs font-bold text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live kW Distribution Subsystems */}
        <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-sky-500/10 border border-sky-500/30 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-sky-600">Isı Pompası & İklim</span>
              <Flame className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {energyFlow.heatPumpKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Toplam yükün %58'i</span>
          </div>

          <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-purple-600">Beyaz Eşya & Mutfak</span>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {energyFlow.appliancesKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Çamaşır & Bulaşık aktif</span>
          </div>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-amber-600">Aydınlatma & Prizler</span>
              <Sun className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {energyFlow.lightsAndPlugsKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Tüm odalar LED & Standby</span>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-emerald-600">Net Günlük Tasarruf</span>
              <PiggyBank className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              +{energyFlow.estimatedDailySavedTL.toFixed(2)} <span className="text-xs font-medium">TL</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Bugün ödenen: {energyFlow.estimatedDailyCostTL.toFixed(2)} TL</span>
          </div>
        </div>
      </div>

      {/* Top Power Consumers Table */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          En Çok Elektrik Tüketen Cihazlar Sıralaması
        </h3>

        <div className="space-y-3">
          {energyFlow.topConsumers.map((item, idx) => (
            <div
              key={item.deviceId}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted font-bold text-xs text-muted-foreground">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{item.deviceName}</h4>
                  <p className="text-[10px] text-muted-foreground">{item.room} • {item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-xs font-bold text-foreground">{item.currentKW.toFixed(2)} kW</div>
                  <span className="text-[10px] text-muted-foreground">Bugün: {item.dailyKWh} kWh</span>
                </div>
                <div className="w-16">
                  <div className="text-[11px] font-bold text-primary">%{item.percentage}</div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Energy Savings Recommendations */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-sm font-bold">LifeOS AI Enerji Optimizasyonu Tavsiyeleri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {energyFlow.smartSavingsTips.map((tip, idx) => (
            <div key={idx} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
