'use client';

import React from 'react';
import { Compass, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useExploreStore } from '@/stores/useExploreStore';

export function ExploreHeader() {
  const { privacySettings, setFamilySafeMode } = useExploreStore();

  return (
    <PageHeader
      backHref="/home"
      icon={<Compass className="h-5 w-5" />}
      title="Keşfet"
      subtitle="LifeOS Paylaşım ve Topluluk Alanı"
      badge={<StatusBadge status="verified" label="Sosyal & Akış" size="sm" />}
      actions={
        <button
          onClick={() => setFamilySafeMode(!privacySettings.familySafeMode)}
          className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 border border-border"
          title="Aile Güvenli Modu"
        >
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">
            {privacySettings.familySafeMode ? 'Aile Modu Açık' : 'Standart'}
          </span>
        </button>
      }
    />
  );
}

