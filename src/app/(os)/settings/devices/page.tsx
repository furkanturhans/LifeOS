'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Laptop, Smartphone, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DevicesSettingsPage() {
  const currentDevice = {
    name: 'LifeOS Web Browser',
    type: 'desktop',
    browser: 'Chrome / Next.js Client',
    location: 'İstanbul, TR',
    lastActive: 'Şu anda aktif',
    isCurrent: true,
  };

  const otherDevices = [
    {
      id: 'dev_1',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      browser: 'LifeOS Mobile App',
      location: 'İstanbul, TR',
      lastActive: '2 saat önce',
      isCurrent: false,
    },
    {
      id: 'dev_2',
      name: 'MacBook Air M2',
      type: 'desktop',
      browser: 'Safari 17.4',
      location: 'Ankara, TR',
      lastActive: '3 gün önce',
      isCurrent: false,
    },
  ];

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Bağlı Cihazlar</h1>
          <p className="text-xs text-muted-foreground">Aktif LifeOS oturumlarınızı yönetin</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{currentDevice.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    Bu Cihaz
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{currentDevice.browser}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-emerald-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {currentDevice.lastActive}
                  </span>
                  <span>•</span>
                  <span>{currentDevice.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-2">
          Diğer Oturumlar
        </h2>

        <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl divide-y divide-white/5 overflow-hidden">
          {otherDevices.map((dev) => (
            <div key={dev.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-white/5 text-muted-foreground">
                  {dev.type === 'mobile' ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Laptop className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{dev.name}</h3>
                  <p className="text-xs text-muted-foreground">{dev.browser}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{dev.lastActive}</span>
                    <span>•</span>
                    <span>{dev.location}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 h-8 px-2"
                onClick={() => alert('Oturum sonlandırıldı.')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="destructive"
          className="w-full mt-4"
          onClick={() => alert('Diğer tüm cihazlardaki oturumlar sonlandırıldı.')}
        >
          Diğer Tüm Oturumlardan Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
