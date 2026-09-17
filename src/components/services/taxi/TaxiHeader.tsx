'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car } from 'lucide-react';
import { useTaxiStore } from '@/stores/useTaxiStore';
import { cn } from '@/lib/utils';

export function TaxiHeader() {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useTaxiStore();

  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 py-3.5 backdrop-blur-md transition-colors sm:px-6">
      <div className="flex items-center justify-between gap-3">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/services')}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Hizmetlere Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
            <Car className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Taksi
              </h1>
              <span className="hidden sm:inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Sabit Fiyat
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Güvenli ve Hızlı Şehiriçi Ulaşım
            </p>
          </div>
        </div>

        {/* Role Switcher (Müşteri / Şoför) */}
        <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setCurrentRole('customer')}
            className={cn(
              'rounded-lg px-3 py-1 font-semibold transition-all',
              currentRole === 'customer'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Müşteri
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('provider')}
            className={cn(
              'rounded-lg px-3 py-1 font-semibold transition-all',
              currentRole === 'provider'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Şoför
          </button>
        </div>
      </div>
    </div>
  );
}

