'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime, formatDate, getGreeting } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { useLocaleRender } from '@/lib/i18n/runtime';

interface StatusBarProps {
  displayName?: string;
}

export function StatusBar({ displayName }: StatusBarProps) {
  const localizeText = useLocaleRender();
  const [time, setTime] = useState(new Date());
  const { locale } = useThemeStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const greeting = getGreeting(time, locale);

  return (
    <div className="relative flex flex-col items-start pt-8 pb-2 px-6 pe-20 text-start">
      {/* Top right notification bell shortcut */}
      <div className="absolute end-6 top-8">
        <Link href="/notifications" aria-label={localizeText("Bildirim Merkezi")}>
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title={localizeText("Bildirim Merkezi")}
          >
            <Bell className="h-4 w-4" />
          </motion.div>
        </Link>
      </div>

      {/* Time */}
      <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {localizeText(formatTime(time))}
      </div>

      {/* Date */}
      <div className="mt-2 text-sm text-muted-foreground font-medium">
        {localizeText(formatDate(time, locale))}
      </div>

      {/* Greeting */}
      {displayName && (
        <div className="mt-3 text-sm text-muted-foreground">
          {localizeText(greeting)}, <span className="font-semibold text-foreground">{displayName}</span> 👋
        </div>
      )}
    </div>
  );
}
