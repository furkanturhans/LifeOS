'use client';

import React from 'react';
import { Bell, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface NotificationHeaderProps {
  onOpenPreferences: () => void;
}

export function NotificationHeader({ onOpenPreferences }: NotificationHeaderProps) {
  return (
    <PageHeader
      backHref="/home"
      icon={<Bell className="h-5 w-5" />}
      title="Bildirimler"
      subtitle="LifeOS Bildirim ve Uyarı Alanı"
      badge={<StatusBadge status="open" label="Merkez" size="sm" />}
      actions={
        <button
          onClick={onOpenPreferences}
          className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 border border-border"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tercihler</span>
        </button>
      }
    />
  );
}

