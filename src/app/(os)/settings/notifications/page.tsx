'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState({
    systemAlerts: true,
    chatMessages: true,
    aiSuggestions: true,
    soundEnabled: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationOptions = [
    {
      id: 'systemAlerts' as const,
      title: 'Sistem ve Güvenlik Bildirimleri',
      description: 'Yeni girişler, güvenlik uyarıları ve sistem güncellemeleri',
      icon: ShieldAlert,
    },
    {
      id: 'chatMessages' as const,
      title: 'Mesajlar ve İletişim',
      description: 'Gelen mesaj ve doğrudan bildirimler',
      icon: MessageSquare,
    },
    {
      id: 'aiSuggestions' as const,
      title: 'LifeOS AI Önerileri',
      description: 'Günün öne çıkanları ve akıllı rutin tavsiyeleri',
      icon: Sparkles,
    },
    {
      id: 'soundEnabled' as const,
      title: 'Ses Efektleri',
      description: 'Bildirim ve sistem etkileşim sesleri',
      icon: Volume2,
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Bildirimler</h1>
          <p className="text-xs text-muted-foreground">Bildirim ve uyarı tercihlerinizi özelleştirin</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl divide-y divide-white/5 overflow-hidden">
        {notificationOptions.map((opt) => {
          const Icon = opt.icon;
          const isEnabled = settings[opt.id];
          return (
            <div
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{opt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </div>

              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                  isEnabled ? 'bg-primary justify-end' : 'bg-muted justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
