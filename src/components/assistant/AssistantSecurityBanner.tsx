'use client';

import React from 'react';
import { ShieldCheck, LockKeyhole, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function AssistantSecurityBanner() {
  return (
    <div className="px-4 mt-4 sm:px-6">
      <Card className="border-border bg-card/60 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Kontrollü Görev & Güvenlik İlkeleri</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <LockKeyhole className="h-3 w-3 text-primary" />
              Veri İzni Zorunlu
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-emerald-500" />
              Kullanıcı Onayı Olmadan Dış İşlem Yapılmaz
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
