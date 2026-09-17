'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, Settings, ShieldCheck } from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function HomePersonalBar() {
  const { user } = useAuthStore();
  const { locale } = useThemeStore();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting =
    locale === 'tr'
      ? hour >= 5 && hour < 12
        ? 'Günaydın'
        : hour >= 12 && hour < 18
        ? 'İyi günler'
        : hour >= 18 && hour < 22
        ? 'İyi akşamlar'
        : 'İyi geceler'
      : hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 18
      ? 'Good afternoon'
      : hour >= 18 && hour < 22
      ? 'Good evening'
      : 'Good night';

  const displayName = user?.displayName || (user?.lifeosId ? `@${user.lifeosId}` : 'Kullanıcı');

  return (
    <div className="px-4 pt-6 pb-2 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Greeting & Status */}
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LifeOS v1.0
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {formatDate(time, locale)} • {formatTime(time)}
            </span>
          </div>

          <h1 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {greeting}, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kişisel yaşam işletim sisteminiz bugün sizin için hazır.
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/notifications">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:border-border/80 hover:bg-muted/50 hover:text-foreground transition-colors shadow-xs"
            >
              <Bell className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Bildirimler</span>
            </motion.div>
          </Link>

          <Link href="/settings">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/50 hover:text-foreground transition-colors shadow-xs"
              title="Ayarlar"
            >
              <Settings className="h-4 w-4" />
            </motion.div>
          </Link>

          <Link href="/profile">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:border-border/80 hover:bg-muted/50 transition-colors shadow-xs"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">{displayName}</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
