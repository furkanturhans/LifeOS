'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Snowflake,
  Droplets,
  Zap,
  VolumeX,
  Gauge,
  Thermometer,
  Sun,
  Activity,
  ChevronUp,
  ChevronDown,
  Power,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

export function HeatPumpView() {
  const { heatPump, controlHeatPump } = useSmartHomeStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!heatPump) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Isı pompası verisi yükleniyor...
      </div>
    );
  }

  const handleModeChange = async (mode: 'heating' | 'cooling' | 'hot_water' | 'eco' | 'off') => {
    setIsUpdating(true);
    await controlHeatPump({ mode });
    setIsUpdating(false);
  };

  const handleTempAdjust = async (delta: number) => {
    const newTemp = Math.round((heatPump.targetTempC + delta) * 2) / 2;
    if (newTemp >= 16 && newTemp <= 30) {
      await controlHeatPump({ targetTempC: newTemp });
    }
  };

  const handleTankTempAdjust = async (delta: number) => {
    const newTemp = Math.round((heatPump.hotWaterTankTargetTempC + delta));
    if (newTemp >= 40 && newTemp <= 65) {
      await controlHeatPump({ hotWaterTankTargetTempC: newTemp });
    }
  };

  const handleToggleSilent = async () => {
    await controlHeatPump({ silentMode: !heatPump.silentMode });
  };

  const handleToggleBoost = async () => {
    await controlHeatPump({ boostMode: !heatPump.boostMode });
  };

  const handleToggleSolarSync = async () => {
    await controlHeatPump({ solarSyncEnabled: !heatPump.solarSyncEnabled });
  };

  return (
    <div className="space-y-6">
      {/* Hero Heat Pump Status Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/30">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  {heatPump.name}
                </h2>
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-500 border border-sky-500/30">
                  {heatPump.mode.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dış Ortam: {heatPump.outdoorAmbientTempC}°C • Kompresör Gücü: {heatPump.compressorPowerKW} kW ({heatPump.compressorFrequencyHz} Hz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground">COP Verimlilik Oranı</span>
              <div className="text-2xl font-black text-sky-500">
                {heatPump.copEfficiency} <span className="text-sm font-bold text-muted-foreground">COP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => handleModeChange('heating')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                heatPump.mode === 'heating'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Isıtma</span>
            </button>

            <button
              onClick={() => handleModeChange('cooling')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                heatPump.mode === 'cooling'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Snowflake className="h-4 w-4" />
              <span>Soğutma</span>
            </button>

            <button
              onClick={() => handleModeChange('hot_water')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                heatPump.mode === 'hot_water'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Droplets className="h-4 w-4" />
              <span>Sıcak Su</span>
            </button>

            <button
              onClick={() => handleModeChange('eco')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                heatPump.mode === 'eco'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Eco Mod</span>
            </button>

            <button
              onClick={() => handleModeChange('off')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                heatPump.mode === 'off'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Power className="h-4 w-4" />
              <span>Kapat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Temperature Adjusters (Room Air & Hot Water Tank) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room Comfort Temp */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Thermometer className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Hedef Oda Sıcaklığı</h3>
                <p className="text-[11px] text-muted-foreground">Mevcut ortam: {heatPump.currentRoomTempC}°C</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded-md">
              Konfor
            </span>
          </div>

          <div className="flex items-center justify-between mt-6 bg-muted/40 rounded-2xl p-4 border border-border/60">
            <button
              onClick={() => handleTempAdjust(-0.5)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-xs hover:bg-muted active:scale-95 text-foreground transition-all"
            >
              <ChevronDown className="h-6 w-6" />
            </button>

            <div className="text-center">
              <span className="text-3xl font-black text-foreground">
                {heatPump.targetTempC.toFixed(1)}
              </span>
              <span className="text-xl font-bold text-muted-foreground ml-1">°C</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Yerden Isıtma Döngüsü</p>
            </div>

            <button
              onClick={() => handleTempAdjust(0.5)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-xs hover:bg-muted active:scale-95 text-foreground transition-all"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Domestic Hot Water Tank Temp */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Droplets className="h-5 w-5 text-cyan-500" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Kullanım Sıcak Suyu (Boyler)</h3>
                <p className="text-[11px] text-muted-foreground">Boyler içi: {heatPump.hotWaterTankTempC}°C</p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-500 bg-cyan-500/15 px-2 py-0.5 rounded-md">
              300L Depo
            </span>
          </div>

          <div className="flex items-center justify-between mt-6 bg-muted/40 rounded-2xl p-4 border border-border/60">
            <button
              onClick={() => handleTankTempAdjust(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-xs hover:bg-muted active:scale-95 text-foreground transition-all"
            >
              <ChevronDown className="h-6 w-6" />
            </button>

            <div className="text-center">
              <span className="text-3xl font-black text-cyan-500">
                {heatPump.hotWaterTankTargetTempC}
              </span>
              <span className="text-xl font-bold text-muted-foreground ml-1">°C</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Anti-Lejyoner Koruması Aktif</p>
            </div>

            <button
              onClick={() => handleTankTempAdjust(1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-xs hover:bg-muted active:scale-95 text-foreground transition-all"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Hydraulic Loop Technical Diagnostics */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Hidrolik Devre & Canlı Sensör Verileri
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5">
            <span className="text-[11px] text-muted-foreground">Gidiş Suyu Sıcaklığı</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {heatPump.waterFlowTempC}°C
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Yerden Isıtmaya Doğru</span>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5">
            <span className="text-[11px] text-muted-foreground">Dönüş Suyu Sıcaklığı</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {heatPump.waterReturnTempC}°C
            </div>
            <span className="text-[10px] text-muted-foreground">ΔT = {(heatPump.waterFlowTempC - heatPump.waterReturnTempC).toFixed(1)}°C Fark</span>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5">
            <span className="text-[11px] text-muted-foreground">Kompresör Frekansı</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {heatPump.compressorFrequencyHz} Hz
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">İnverter Modülasyonu</span>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border/50 p-3.5">
            <span className="text-[11px] text-muted-foreground">Günlük Isıtma Tüketimi</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {heatPump.dailyHeatingKWh} kWh
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">%{Math.round((heatPump.copEfficiency - 1) / heatPump.copEfficiency * 100)} Doğal Enerji</span>
          </div>
        </div>
      </div>

      {/* Advanced Comfort & Solar Sync Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={handleToggleSilent}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            heatPump.silentMode
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <VolumeX className="h-5 w-5 text-indigo-500" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${heatPump.silentMode ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {heatPump.silentMode ? 'AÇIK' : 'KAPALI'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-foreground">Sessiz Mod (Gece)</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dış ünite fan ve kompresör desibelini 35 dB altına düşürür.
          </p>
        </div>

        <div
          onClick={handleToggleBoost}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            heatPump.boostMode
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${heatPump.boostMode ? 'bg-amber-500 text-slate-950' : 'bg-muted text-muted-foreground'}`}>
              {heatPump.boostMode ? 'AÇIK' : 'KAPALI'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-foreground">Hızlı Isıtma (Boost)</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hedef sıcaklığa en kısa sürede ulaşmak için tam güç kompresör devreye girer.
          </p>
        </div>

        <div
          onClick={handleToggleSolarSync}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            heatPump.solarSyncEnabled
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Sun className="h-5 w-5 text-emerald-500" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${heatPump.solarSyncEnabled ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {heatPump.solarSyncEnabled ? 'AÇIK' : 'KAPALI'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-foreground">Solar Pik Senkronizasyonu</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Güneş panelleri fazla ürettiğinde boyler suyunu bedava enerjiyle 58°C’ye kadar depolar.
          </p>
        </div>
      </div>
    </div>
  );
}
