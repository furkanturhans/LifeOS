'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function ArcadeHeader() {
  return (
    <PageHeader
      backHref="/home"
      icon={<Gamepad2 className="h-5 w-5" />}
      title="Arcade"
      subtitle="LifeOS Oyun & Aktivite Merkezi"
      badge={<StatusBadge status="bidding" label="Eğlence" size="sm" />}
      actions={
        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
          <span>Beta</span>
        </div>
      }
    />
  );
}

