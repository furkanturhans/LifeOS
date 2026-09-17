'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime, formatDate } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';

interface StatusBarProps {
  displayName?: string;
}

export function StatusBar({ displayName }: StatusBarProps) {
  const [time, setTime] = useState(new Date());
  const { locale } = useThemeStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hour = time.getHours();
  const greeting =
    locale === 'tr'
      ? hour >= 5 && hour < 12
        ? 'Günaydın'
        : hour >= 12 && hour < 17
        ? 'İyi günler'
        : hour >= 17 && hour < 21
        ? 'İyi akşamlar'
        : 'İyi geceler'
      : hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 17
      ? 'Good afternoon'
      : hour >= 17 && hour < 21
      ? 'Good evening'
      : 'Good night';

  return (
    <div className="relative flex flex-col items-center pt-8 pb-4 px-6 text-center">
      {/* Top right notification bell shortcut */}
      <div className="absolute right-6 top-6">
        <Link href="/notifications">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title="Bildirim Merkezi"
          >
            <Bell className="h-4 w-4" />
          </motion.div>
        </Link>
      </div>

      {/* Time */}
      <div className="text-6xl font-thin tracking-tight text-foreground tabular-nums">
        {formatTime(time)}
      </div>

      {/* Date */}
      <div className="mt-1 text-base text-muted-foreground font-medium">
        {formatDate(time, locale)}
      </div>

      {/* Greeting */}
      {displayName && (
        <div className="mt-3 text-sm text-muted-foreground">
          {greeting}, <span className="font-semibold text-foreground">{displayName}</span> 👋
        </div>
      )}
    </div>
  );
}
