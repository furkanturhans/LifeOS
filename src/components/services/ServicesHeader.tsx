'use client';

import React from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';

export function ServicesHeader() {
  return (
    <PageHeader
      title="Hizmetler"
      subtitle="Günlük yaşam, ulaşım, nakliye ve usta çözümleri"
      icon={<Briefcase className="h-4 w-4 text-primary" />}
      backHref="/home"
      badge={
        <Badge variant="secondary" className="text-[10px] py-0 px-2">
          Merkez
        </Badge>
      }
      action={
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>4 Aktif Alan</span>
        </div>
      }
    />
  );
}

