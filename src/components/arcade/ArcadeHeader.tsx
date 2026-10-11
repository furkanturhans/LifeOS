'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function ArcadeHeader() {
  const localizeText = useLocaleRender();
  return (
    <PageHeader
      backHref="/home"
      icon={<Gamepad2 className="h-5 w-5" />}
      title={localizeText("Arcade")}
      subtitle={localizeText("LifeOS Oyun & Aktivite Merkezi")}
      badge={<StatusBadge status="bidding" label={localizeText("Eğlence")} size="sm" />}
      actions={
        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
          <span>{localizeText("Beta")}</span>
        </div>
      }
    />
  );
}

