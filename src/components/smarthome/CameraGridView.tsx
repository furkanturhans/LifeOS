'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Maximize2,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Video,
  CircleDot,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';

export function CameraGridView() {
  const { cameras, controlCamera, currentRole } = useSmartHomeStore();
  const [selectedCamId, setSelectedCamId] = useState<string>(cameras[0]?.id || 'cam-salon');
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (currentRole === 'child') {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto mb-3 text-muted-foreground">
          <EyeOff className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Güvenlik Kamerası Erişimi Kısıtlı</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Çocuk profilleri için güvenlik kameralarına erişim ve canlı yayın izleme aile güvenliği gereği devre dışıdır.
        </p>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Bağlı güvenlik kamerası bulunamadı.
      </div>
    );
  }

  const selectedCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  const handleTogglePrivacy = async (camId: string, currentVal: boolean) => {
    setIsActionLoading(true);
    await controlCamera({ cameraId: camId, privacyMode: !currentVal });
    setIsActionLoading(false);
  };

  const handleToggleNightVision = async (camId: string, currentVal: boolean) => {
    setIsActionLoading(true);
    await controlCamera({ cameraId: camId, nightVision: !currentVal });
    setIsActionLoading(false);
  };

  const handlePtz = async (camId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    await controlCamera({ cameraId: camId, ptzDirection: direction });
  };

  return (
    <div className="space-y-6">
      {/* Active Featured Camera Live Feed */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
          {selectedCam.privacyMode ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
              <EyeOff className="h-12 w-12 text-amber-500 mb-2 animate-pulse" />
              <h4 className="text-base font-bold text-white">Gizlilik Modu Aktif</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Kamera fiziksel lens kapağı kapatıldı ve canlı yayın akışı durduruldu.
              </p>
              <button
                onClick={() => handleTogglePrivacy(selectedCam.id, true)}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90"
              >
                Gizlilik Modunu Aç / Yayını Başlat
              </button>
            </div>
          ) : (
            <>
              {/* Camera Live Stream simulation background */}
              <img
                src={selectedCam.streamUrl}
                alt={selectedCam.name}
                className="w-full h-full object-cover"
              />

              {/* Top Stream Overlays (Live REC, FPS, Resolution) */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                    <CircleDot className="h-3 w-3 animate-ping" />
                    CANLI
                  </span>
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-xs font-semibold">
                    {selectedCam.name} ({selectedCam.room})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono">
                    {selectedCam.resolution} • 30 FPS
                  </span>
                  {selectedCam.motionDetected && (
                    <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      Hareket Algılandı
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Stream Controls (PTZ, Night Vision, Privacy) */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                  <button
                    onClick={() => handleTogglePrivacy(selectedCam.id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                    <span>Gizlilik Kapağı</span>
                  </button>

                  <button
                    onClick={() => handleToggleNightVision(selectedCam.id, selectedCam.nightVision)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedCam.nightVision
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Gece Görüşü</span>
                  </button>
                </div>

                {/* PTZ Joystick Control if camera supports it */}
                {selectedCam.ptzCapable && (
                  <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                    <button
                      onClick={() => handlePtz(selectedCam.id, 'left')}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                      title="Sola Çevir"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePtz(selectedCam.id, 'up')}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                      title="Yukarı Çevir"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePtz(selectedCam.id, 'down')}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                      title="Aşağı Çevir"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePtz(selectedCam.id, 'right')}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                      title="Sağa Çevir"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Multi-Camera Channel Thumbnails */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tüm Güvenlik Kameraları ({cameras.length} Kanal)
          </h3>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Yerel WiFi RTSP Yayını Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              onClick={() => setSelectedCamId(cam.id)}
              className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all ${
                selectedCamId === cam.id
                  ? 'border-primary ring-2 ring-primary/30 shadow-md'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                {cam.privacyMode ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                    <EyeOff className="h-6 w-6 text-amber-500/60 mb-1" />
                    <span className="text-[10px] font-bold">Gizlilik Modu</span>
                  </div>
                ) : (
                  <img
                    src={cam.streamUrl}
                    alt={cam.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white">
                    CANLI
                  </span>
                  {cam.motionDetected && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                      Hareket
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-card flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground truncate">{cam.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{cam.room} • {cam.resolution}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePrivacy(cam.id, cam.privacyMode);
                  }}
                  className="p-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Gizlilik Kapağı"
                >
                  {cam.privacyMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
