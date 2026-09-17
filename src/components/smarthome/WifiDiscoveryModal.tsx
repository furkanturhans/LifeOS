'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  X,
  RefreshCw,
  Server,
  Sun,
  Flame,
  Camera,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

interface WifiDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WifiDiscoveryModal({ isOpen, onClose }: WifiDiscoveryModalProps) {
  const { isScanningWifi, wifiScanDevices, scanWifiNetwork } = useSmartHomeStore();

  useEffect(() => {
    if (isOpen && wifiScanDevices.length === 0) {
      scanWifiNetwork();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home_assistant':
        return <Server className="h-5 w-5 text-indigo-500" />;
      case 'solar_inverter':
        return <Sun className="h-5 w-5 text-amber-500" />;
      case 'heat_pump':
        return <Flame className="h-5 w-5 text-sky-500" />;
      case 'matter_bridge':
        return <Layers className="h-5 w-5 text-emerald-500" />;
      case 'camera_rtsp':
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <Cpu className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Yerel WiFi & Akıllı Cihaz Keşif Radarı
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  192.168.1.0/24 alt ağındaki Home Assistant, İnverter, Isı Pompası ve Matter cihazları
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scanner Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60 mb-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isScanningWifi ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-xs font-semibold text-foreground">
                {isScanningWifi ? 'Ağ taranıyor (mDNS, SSDP, Modbus TCP)...' : `${wifiScanDevices.length} Akıllı Cihaz Keşfedildi`}
              </span>
            </div>

            <button
              onClick={() => scanWifiNetwork()}
              disabled={isScanningWifi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted active:scale-95 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanningWifi ? 'animate-spin' : ''}`} />
              <span>Yeniden Tara</span>
            </button>
          </div>

          {/* Found Devices List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {wifiScanDevices.map((dev) => (
              <div
                key={dev.ip}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border/60">
                    {getTypeIcon(dev.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">{dev.vendor}</h4>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                        {dev.ip}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {dev.model} • Ping: <span className="text-emerald-600 font-semibold">{dev.pingMs} ms</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {dev.isConfigured ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Bağlı
                    </span>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-xl transition-colors"
                    >
                      <span>Eşle</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Tüm iletişim yerel ağda (LAN) şifreli ve doğrudan gerçekleşir.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
