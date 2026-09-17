'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Zap,
  BatteryCharging,
  BatteryMedium,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Flame,
  Leaf,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

export function SolarInverterView() {
  const { solar, controlSolarInverter } = useSmartHomeStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!solar) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Solar inverter sistemi verisi yükleniyor...
      </div>
    );
  }

  const handleActionChange = async (
    action: 'battery_first' | 'ev_charge' | 'heat_pump_hotwater' | 'grid_export'
  ) => {
    setIsUpdating(true);
    await controlSolarInverter({ surplusAction: action });
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Energy Production Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30">
              <Sun className="h-8 w-8 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  Güneş & İnverter Santrali
                </h2>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                  Üretim Aktif
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {solar.inverterModel} • Verimlilik: %{solar.inverterEfficiency} • Sıcaklık: {solar.inverterTempC}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground">Anlık Solar Üretim</span>
              <div className="text-2xl font-black text-amber-500">
                {solar.solarProductionKW.toFixed(2)} <span className="text-sm font-bold">kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Energy Flow Diagram */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Canlı Enerji Akış Şeması (WiFi & Modbus)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* 1. Solar Panels */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-md">
                  GÜNEŞ
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-foreground">
                  {solar.solarProductionKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Bugün: <span className="font-bold text-foreground">{solar.dailySolarKWh} kWh</span>
                </div>
              </div>
            </div>

            {/* 2. Battery Storage */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <BatteryCharging className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  BATARYA DEPOSU
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-500">%{solar.batteryLevelPercent}</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    (+{solar.batteryPowerKW} kW Şarj)
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Kapasite: {solar.batteryCapacityKWh} kWh • Sağlık: %{solar.batteryHealthPercent}
                </div>
              </div>
            </div>

            {/* 3. Home Consumption */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/20 px-2 py-0.5 rounded-md">
                  EV TÜKETİMİ
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-foreground">
                  {solar.homeConsumptionKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Öz Tüketim: <span className="font-bold text-blue-600">%{solar.selfSufficiencyPercent} Güneş</span>
                </div>
              </div>
            </div>

            {/* 4. Grid Feed-In */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/20 px-2 py-0.5 rounded-md">
                  ŞEBEKE İHRACAT
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-purple-500">
                  +{solar.gridFeedInKW.toFixed(2)} <span className="text-xs font-medium text-muted-foreground">kW</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Şebekeden Çekilen: <span className="font-bold text-foreground">{solar.gridDrawKW} kW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Surplus Strategy Selector */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Güneş Fazlası Otomatik Dağıtım Politikası
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Üretilen fazla enerjinin LifeOS tarafından otomatik yönlendirileceği öncelikli hedef
            </p>
          </div>
          <span className="text-xs font-bold text-primary">Akıllı Karar Motoru</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <button
            onClick={() => handleActionChange('battery_first')}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              solar.solarSurplusAutoAction === 'battery_first'
                ? 'border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500'
                : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <BatteryCharging className="h-4.5 w-4.5 text-emerald-500" />
              {solar.solarSurplusAutoAction === 'battery_first' && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  Seçili
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">1. Batarya Depolama</span>
            <span className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Önce ev bataryasını %100 doldur, gece sıfır şebeke tüketimi sağla.
            </span>
          </button>

          <button
            onClick={() => handleActionChange('heat_pump_hotwater')}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              solar.solarSurplusAutoAction === 'heat_pump_hotwater'
                ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500'
                : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <Flame className="h-4.5 w-4.5 text-amber-500" />
              {solar.solarSurplusAutoAction === 'heat_pump_hotwater' && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  Seçili
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">2. Isı Pompası Sıcak Su</span>
            <span className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Fazla güneş gücüyle boyler sıcak suyunu 58°C’ye aşırı ısıtarak enerji depola.
            </span>
          </button>

          <button
            onClick={() => handleActionChange('ev_charge')}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              solar.solarSurplusAutoAction === 'ev_charge'
                ? 'border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500'
                : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <Zap className="h-4.5 w-4.5 text-blue-500" />
              {solar.solarSurplusAutoAction === 'ev_charge' && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-500/20 px-1.5 py-0.5 rounded">
                  Seçili
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">3. Elektrikli Araç Şarjı</span>
            <span className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Wallbox üzerinden sadece güneş fazlasıyla aracı dinamik akımla şarj et.
            </span>
          </button>

          <button
            onClick={() => handleActionChange('grid_export')}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              solar.solarSurplusAutoAction === 'grid_export'
                ? 'border-purple-500 bg-purple-500/10 text-foreground ring-1 ring-purple-500'
                : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <TrendingUp className="h-4.5 w-4.5 text-purple-500" />
              {solar.solarSurplusAutoAction === 'grid_export' && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/20 px-1.5 py-0.5 rounded">
                  Seçili
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-foreground">4. Şebekeye Satış (Feed-In)</span>
            <span className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Tüm fazlayı anında şebekeye satarak elektrik faturasına mahsup et.
            </span>
          </button>
        </div>
      </div>

      {/* Monthly Metrics & Environmental Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Aylık Toplam Üretim</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {solar.monthlySolarKWh} <span className="text-xs text-muted-foreground">kWh</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Geçen aya göre +%14 artış</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
            <Leaf className="h-4 w-4 text-emerald-500" />
            <span>Karbon Salımı Engelleme</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {solar.co2SavedKg} <span className="text-xs text-muted-foreground">kg CO2</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">~0.9 ağaç dikimine eşdeğer</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>İnverter Sağlık Durumu</span>
          </div>
          <div className="text-xl font-bold text-foreground">Kusursuz (Normal)</div>
          <p className="text-[11px] text-muted-foreground mt-1">Modbus TCP 502 portu aktif</p>
        </div>
      </div>
    </div>
  );
}
