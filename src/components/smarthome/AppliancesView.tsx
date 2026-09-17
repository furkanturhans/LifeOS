'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  WashingMachine,
  Sparkles,
  Play,
  Pause,
  Square,
  Sun,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Flame,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';
import type { SmartApplianceSystem } from '@/types/smarthome';

export function AppliancesView() {
  const { appliances, controlAppliance, solar } = useSmartHomeStore();
  const [activeApplianceId, setActiveApplianceId] = useState<string | null>(null);

  if (appliances.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bağlı akıllı ev aleti bulunamadı.
      </div>
    );
  }

  const handleCommand = async (
    applianceId: string,
    command: 'start' | 'pause' | 'stop' | 'toggle_solar_sync'
  ) => {
    await controlAppliance({ applianceId, command });
  };

  const getApplianceIcon = (type: string) => {
    switch (type) {
      case 'washing_machine':
        return <WashingMachine className="h-6 w-6 text-sky-500" />;
      case 'dishwasher':
        return <Sparkles className="h-6 w-6 text-emerald-500" />;
      case 'oven':
        return <Flame className="h-6 w-6 text-amber-500" />;
      case 'robot_vacuum':
        return <Bot className="h-6 w-6 text-purple-500" />;
      case 'coffee_maker':
        return <Coffee className="h-6 w-6 text-orange-500" />;
      default:
        return <Zap className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Solar Eco-Schedule Banner */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-md">
              <Sun className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Güneş Pikiyle Akıllı Otomatik Başlatma (Solar Sync)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Çamaşır ve Bulaşık makineleriniz çatıdaki solar üretim {solar?.solarProductionKW ? `${solar.solarProductionKW.toFixed(1)} kW` : '2.5 kW'} üzerine çıktığında bedava elektrikle çalıştırılır.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/30">
              ⚡ Sıfır Şebeke Maliyeti
            </span>
          </div>
        </div>
      </div>

      {/* Appliances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appliances.map((app) => (
          <Card key={app.id} className="border-border bg-card p-5 shadow-2xs">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 border border-border/80">
                  {getApplianceIcon(app.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                    <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                      {app.energyRating}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {app.room} • {app.programName}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  app.state === 'running' || app.state === 'cleaning'
                    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                    : app.state === 'paused'
                    ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {app.state === 'running'
                  ? 'Çalışıyor'
                  : app.state === 'cleaning'
                  ? 'Temizlikte'
                  : app.state === 'paused'
                  ? 'Duraklatıldı'
                  : 'Beklemede'}
              </span>
            </div>

            {/* Progress Bar & Remaining Time */}
            {app.state === 'running' && (
              <div className="mb-4 bg-muted/30 rounded-xl p-3 border border-border/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Kalan Süre: <strong className="text-foreground">{app.remainingMinutes} dakika</strong>
                  </span>
                  <span className="font-bold text-primary">%{app.progressPercent}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${app.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Power & Solar Sync Info */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <span className="text-[10px] text-muted-foreground">Anlık Güç Çekişi</span>
                <div className="font-bold text-foreground mt-0.5">
                  {app.currentPowerWatt} Watt
                </div>
              </div>

              <div
                onClick={() => handleCommand(app.id, 'toggle_solar_sync')}
                className={`cursor-pointer rounded-xl p-2.5 border transition-all ${
                  app.solarEcoStartSchedule
                    ? 'border-amber-500/40 bg-amber-500/10 text-foreground'
                    : 'border-border/40 bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold">Güneşle Başlat</span>
                  <Sun className={`h-3.5 w-3.5 ${app.solarEcoStartSchedule ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </div>
                <div className="font-bold text-[11px] mt-0.5">
                  {app.solarEcoStartSchedule ? 'Aktif (Güneş Piki)' : 'Pasif'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              {app.state === 'running' ? (
                <>
                  <button
                    onClick={() => handleCommand(app.id, 'pause')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Duraklat</span>
                  </button>
                  <button
                    onClick={() => handleCommand(app.id, 'stop')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold transition-colors"
                  >
                    <Square className="h-3.5 w-3.5" />
                    <span>İptal Et</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCommand(app.id, 'start')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 active:scale-98 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Programı Başlat ({app.programName})</span>
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
