'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Database, Lock, UserCheck, Shield } from 'lucide-react';

export default function PrivacySettingsPage() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    dataTelemetry: false,
    activityLog: true,
  });

  const toggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen pb-28 pt-8 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/settings"
          className="p-2 rounded-xl bg-card/60 hover:bg-card border border-white/10 text-foreground transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Gizlilik</h1>
          <p className="text-xs text-muted-foreground">Veri paylaşımı ve görünürlük ayarları</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl divide-y divide-white/5 overflow-hidden">
        <div
          onClick={() => toggle('profileVisibility')}
          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Arama ve Profil Görünürlüğü</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Diğer LifeOS kullanıcıları sizi @kullaniciadi ile bulabilir</p>
            </div>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              privacy.profileVisibility ? 'bg-primary justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </div>
        </div>

        <div
          onClick={() => toggle('activityLog')}
          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Aktivite ve Denetim Günlüğü</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Güvenlik için modül ve cihaz erişim günlüklerini yerel olarak tut</p>
            </div>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              privacy.activityLog ? 'bg-primary justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </div>
        </div>

        <div
          onClick={() => toggle('dataTelemetry')}
          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Anonim Telemetri ve Hata Raporları</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sistem kararlılığını artırmak için isimsiz çökme raporları gönder</p>
            </div>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              privacy.dataTelemetry ? 'bg-primary justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
