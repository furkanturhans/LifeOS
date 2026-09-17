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
  Trash2,
  Sliders,
  QrCode,
  Globe,
  Home,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SmartDevice, SmartHomeRole } from '@/types/smarthome';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: SmartDevice;
  onToggle: (device: SmartDevice) => void;
  onRequestPin?: (device: SmartDevice) => void;
  onRemove?: (device: SmartDevice) => void;
  userRole?: SmartHomeRole;
}

export function DeviceCard({
  device,
  onToggle,
  onRequestPin,
  onRemove,
  userRole = 'home_owner',
}: DeviceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = () => {
    switch (device.category) {
      case 'light':
        return <Lightbulb className="h-5 w-5" />;
      case 'switch':
        return <Power className="h-5 w-5" />;
      case 'climate':
        return <Thermometer className="h-5 w-5" />;
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
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  const getSourceBadge = () => {
    switch (device.source) {
      case 'matter':
        return (
          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 border border-emerald-500/20">
            <QrCode className="h-2.5 w-2.5" />
            Matter
          </span>
        );
      case 'home_assistant':
        return (
          <span className="flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.2 text-[9px] font-bold text-sky-600 border border-sky-500/20">
            <Home className="h-2.5 w-2.5" />
            Home Assistant
          </span>
        );
      case 'vendor_oauth':
        return (
          <span className="flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold text-purple-600 border border-purple-500/20">
            <Globe className="h-2.5 w-2.5" />
            {device.vendorName || 'Resmi Hesap'}
          </span>
        );
      default:
        return null;
    }
  };

  const isActive = device.state === 'on' || device.state === 'open' || device.state === 'alarm';
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'p-4 rounded-3xl border transition-all duration-200 select-none flex flex-col justify-between min-h-[148px] relative overflow-hidden',
        isAlarm
          ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/50 animate-pulse'
          : isActive || (device.category === 'lock' && isLocked)
          ? 'border-primary/40 bg-card shadow-xs ring-1 ring-primary/20'
          : 'border-border/70 bg-card/60 opacity-85 hover:opacity-100 hover:border-border'
      )}
    >
      {/* Top Row: Icon, Device Info & Controls */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl border transition-all shrink-0',
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
            <div className="flex items-center gap-1.5 flex-wrap">
              {getSourceBadge()}
              {device.room && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {device.room}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-foreground truncate block max-w-[130px] mt-0.5">
              {device.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
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
                isAlarm ? 'bg-rose-500 text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              {isAlarm ? 'ALARM' : device.state.toUpperCase()}
            </span>
          )}

          {/* Delete Device Button (Available on Hover or Owner) */}
          {onRemove && isHovered && userRole === 'home_owner' && (
            <button
              type="button"
              onClick={() => onRemove(device)}
              title="Cihazı Kaldır"
              className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: STRICTLY REAL Verified Capabilities Only */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs mt-2">
        <div className="text-[11px] text-muted-foreground truncate">
          {/* Temperature sensor */}
          {device.capabilities.hasTemperature && device.attributes.currentTemperature !== undefined ? (
            <span className="font-semibold text-foreground">
              {device.attributes.currentTemperature}°C
              {device.attributes.targetTemperature !== undefined && ` • Hedef: ${device.attributes.targetTemperature}°C`}
            </span>
          ) : device.capabilities.hasHumidity && device.attributes.humidity !== undefined ? (
            <span className="font-semibold text-foreground">
              %{device.attributes.humidity} Nem
            </span>
          ) : device.capabilities.hasPowerMeasurement && device.attributes.powerWatt !== undefined ? (
            <span className="font-semibold text-foreground font-mono">
              ⚡ {device.attributes.powerWatt} W
            </span>
          ) : device.category === 'door_window' ? (
            <span className={cn('font-bold', device.state === 'open' ? 'text-amber-500' : 'text-emerald-500')}>
              {device.state === 'open' ? 'Açık' : 'Kapalı'}
            </span>
          ) : device.category === 'motion' ? (
            <span className={cn('font-bold', device.state === 'on' ? 'text-amber-500' : 'text-muted-foreground')}>
              {device.state === 'on' ? 'Hareket Algılandı' : 'Sakin'}
            </span>
          ) : (
            <span>
              {isActive ? 'Aktif çalışıyor' : 'Kapalı / Beklemede'}
            </span>
          )}
        </div>

        {/* Battery level if supported */}
        {device.capabilities.hasBattery && device.attributes.batteryLevel !== undefined && (
          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
            🔋 %{device.attributes.batteryLevel}
          </span>
        )}
      </div>
    </Card>
  );
}
