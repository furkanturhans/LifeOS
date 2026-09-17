'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wrench } from 'lucide-react';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import { cn } from '@/lib/utils';

export function CraftsmanHeader() {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useCraftsmanStore();

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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs">
            <Wrench className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Usta
              </h1>
              <span className="hidden sm:inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Doğrulanmış
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Ev Bakım, Onarım ve Montaj Hizmetleri
            </p>
          </div>
        </div>

        {/* Role Switcher (Müşteri / Usta) */}
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
            Usta
          </button>
        </div>
      </div>
    </div>
  );
}

