'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Power,
  Thermometer,
  Lock,
  Unlock,
  Camera,
  DoorOpen,
  Activity,
  AlertTriangle,
  Flame,
  Droplets,
  Tv,
  Wind,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sun,
  WashingMachine,
  Zap,
  BatteryCharging,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SmartDevice, SmartHomeRole } from '@/types/smarthome';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: SmartDevice;
  onToggle: (device: SmartDevice) => void;
  onRequestPin?: (device: SmartDevice) => void;
  onOpenDetail?: (device: SmartDevice) => void;
  userRole?: SmartHomeRole;
}

export function DeviceCard({ device, onToggle, onRequestPin, onOpenDetail, userRole = 'home_owner' }: DeviceCardProps) {
  const getCategoryIcon = () => {
    switch (device.category) {
      case 'light':
        return <Lightbulb className="h-5 w-5" />;
      case 'switch':
        return <Power className="h-5 w-5" />;
      case 'climate':
        return <Thermometer className="h-5 w-5" />;
      case 'solar_inverter':
        return <Sun className="h-5 w-5 text-amber-500" />;
      case 'heat_pump':
        return <Flame className="h-5 w-5 text-sky-500" />;
      case 'battery_storage':
        return <BatteryCharging className="h-5 w-5 text-emerald-500" />;
      case 'appliance':
        return <WashingMachine className="h-5 w-5 text-purple-500" />;
      case 'lock':
        return device.state === 'locked' ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />;
      case 'camera':
        return <Camera className="h-5 w-5" />;
      case 'door_window':
        return <DoorOpen className="h-5 w-5" />;
      case 'motion':
        return <Activity className="h-5 w-5" />;
      case 'safety_sensor':
        return device.attributes.alarmType === 'water_leak' ? (
          <Droplets className="h-5 w-5 text-cyan-400" />
        ) : (
          <Flame className="h-5 w-5 text-rose-500" />
        );
      case 'media_player':
        return <Tv className="h-5 w-5" />;
      case 'vacuum':
        return <Wind className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  const isActive = device.state === 'on' || device.state === 'open' || device.state === 'alarm' || device.state === 'generating' || device.state === 'heating' || device.state === 'running';
  const isLocked = device.state === 'locked';
  const isAlarm = device.state === 'alarm';

  const handleAction = () => {
    if (device.category === 'lock' && device.state === 'locked') {
      if (onRequestPin) onRequestPin(device);
      return;
    }
    onToggle(device);
  };

  return (
    <Card
      className={cn(
        'p-4 rounded-3xl border transition-all duration-200 select-none flex flex-col justify-between h-40 relative overflow-hidden',
        isAlarm
          ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/50 animate-pulse'
          : isActive || (device.category === 'lock' && isLocked)
          ? 'border-primary/40 bg-card shadow-xs ring-1 ring-primary/20'
          : 'border-border/70 bg-card/60 opacity-85 hover:opacity-100 hover:border-border'
      )}
    >
      {/* Top row: Icon, Category Badge & Action Button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl border transition-all',
              isAlarm
                ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                : isActive
                ? 'bg-primary/15 text-primary border-primary/30 shadow-xs'
                : isLocked
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-muted text-muted-foreground border-border/70'
            )}
          >
            {getCategoryIcon()}
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              {device.room}
            </span>
            <span className="text-xs font-bold text-foreground truncate block max-w-[130px]">
              {device.name}
            </span>
          </div>
        </div>

        {/* Quick Toggle / Control Button */}
        {device.category === 'light' || device.category === 'switch' ? (
          <button
            type="button"
            onClick={handleAction}
            aria-label="Cihazı aç/kapat"
            className={cn(
              'h-8 w-14 rounded-full transition-all flex items-center p-1 relative shadow-inner',
              isActive ? 'bg-primary justify-end' : 'bg-muted justify-start'
            )}
          >
            <div className="h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-foreground">
              <Power className={cn('h-3 w-3', isActive ? 'text-primary' : 'text-muted-foreground')} />
            </div>
          </button>
        ) : device.category === 'lock' ? (
          <button
            type="button"
            onClick={handleAction}
            className={cn(
              'px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1',
              isLocked
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
            )}
          >
            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            <span>{isLocked ? 'Kilitli' : 'Açık'}</span>
          </button>
        ) : (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold',
              isAlarm
                ? 'bg-rose-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isAlarm ? 'ALARM' : device.state.toUpperCase()}
          </span>
        )}
      </div>

      {/* Bottom row: Attributes / Live Info */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <div className="text-[11px] text-muted-foreground truncate">
          {device.category === 'solar_inverter' ? (
            <span className="font-bold text-amber-500">
              ☀️ {device.attributes.solarProductionKW || 4.85} kW Üretim
            </span>
          ) : device.category === 'heat_pump' ? (
            <span className="font-bold text-sky-500">
              🔥 Su: {device.attributes.waterFlowTempC || 44.5}°C • COP {device.attributes.copEfficiency || 4.65}
            </span>
          ) : device.category === 'appliance' ? (
            <span className="font-semibold text-foreground">
              🧺 {device.attributes.programName || 'Pamuklu Eko'} ({device.attributes.remainingMinutes || 38} dk)
            </span>
          ) : device.category === 'climate' && device.attributes.currentTemperature ? (
            <span className="font-semibold text-foreground">
              {device.attributes.currentTemperature}°C • Hedef: {device.attributes.targetTemperature || 22}°C
            </span>
          ) : device.category === 'sensor' && device.attributes.currentTemperature ? (
            <span className="font-semibold text-foreground">
              {device.attributes.currentTemperature}°C • %{device.attributes.humidity || 45} Nem
            </span>
          ) : device.category === 'switch' && device.attributes.powerWatt ? (
            <span className="font-semibold text-foreground font-mono">
              ⚡ {device.attributes.powerWatt} W
            </span>
          ) : device.category === 'safety_sensor' ? (
            <span className={cn('font-bold', isAlarm ? 'text-rose-500' : 'text-emerald-500')}>
              {isAlarm ? 'Kritik Uyarı Algılandı!' : 'Normal Durum'}
            </span>
          ) : (
            <span>
              {isActive ? 'Aktif çalışıyor' : 'Kapalı / Beklemede'}
            </span>
          )}
        </div>

        {device.attributes.batteryLevel !== undefined && (
          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
            🔋 %{device.attributes.batteryLevel}
          </span>
        )}
      </div>
    </Card>
  );
}
