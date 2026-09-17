'use client';

import React, { useEffect, useState } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ShieldCheck,
  AlertTriangle,
  Users,
  Wifi,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useConnectStore } from '@/stores/useConnectStore';

export function ConnectCallModal() {
  const {
    isCallModalOpen,
    callSession,
    liveKitTokenData,
    isMicMuted,
    isCamMuted,
    toggleMic,
    toggleCam,
    endCall,
    activeConversationId,
    conversations,
  } = useConnectStore();

  const [callDuration, setCallDuration] = useState(0);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCallModalOpen && liveKitTokenData?.configured) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallModalOpen, liveKitTokenData?.configured]);

  if (!isCallModalOpen || !callSession) return null;

  const isConfigured = liveKitTokenData?.configured ?? false;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex h-[520px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {activeConv?.title || 'LifeOS Connect Görüşmesi'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi className="h-3 w-3" />
                  {isConfigured ? 'LiveKit Güvenli Bağlantı' : 'Yapılandırma Bekleniyor'}
                </span>
                {isConfigured && <span>• {formatDuration(callDuration)}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Gizli Kimlik Koruması
            </span>
          </div>
        </div>

        {/* Center Stage */}
        <div className="relative flex flex-1 flex-col items-center justify-center p-6 text-center">
          {!isConfigured ? (
            /* Unconfigured State */
            <div className="max-w-md space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Arama Altyapısı Hazırlanıyor
                </h4>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  LiveKit sesli ve görüntülü arama sunucusu ortam değişkenleri (
                  <code className="text-[11px] text-amber-300">LIVEKIT_URL</code>,{' '}
                  <code className="text-[11px] text-amber-300">LIVEKIT_API_KEY</code>,{' '}
                  <code className="text-[11px] text-amber-300">LIVEKIT_API_SECRET</code>
                  ) tanımlandığında aramalar doğrudan başlayacaktır.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Güvenlik İlkesi:</span> Sahte arama başlatılmaz; iletişim bilgileri ve numaralar asla karşı tarafa sızdırılmaz.
              </div>
            </div>
          ) : (
            /* Active Call Simulation / LiveKit Room Ready */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 ring-8 ring-primary/10 animate-pulse">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                    {activeConv?.title?.slice(0, 2).toUpperCase() || 'LC'}
                  </div>
                </div>
                {isMicMuted && (
                  <div className="absolute bottom-0 right-0 rounded-full bg-red-500 p-1.5 text-white shadow-md">
                    <MicOff className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-foreground">
                  {callSession.type === 'video' ? 'Görüntülü Görüşme' : 'Sesli Görüşme'}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Oda: <code className="text-foreground">{callSession.roomName}</code>
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Bağlandı ({formatDuration(callDuration)})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Action Bar */}
        <div className="flex items-center justify-center gap-4 border-t border-border/50 bg-background/60 px-6 py-4">
          {/* Mic Toggle */}
          <button
            onClick={toggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              isMicMuted
                ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
            title={isMicMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
          >
            {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Cam Toggle */}
          <button
            onClick={toggleCam}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              isCamMuted
                ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
            title={isCamMuted ? 'Kamerayı Aç' : 'Kamerayı Kapat'}
          >
            {isCamMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>

          {/* Hangup / Close */}
          <button
            onClick={endCall}
            className="flex h-12 items-center gap-2 rounded-2xl bg-red-500 px-6 font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="text-xs">Görüşmeyi Sonlandır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
