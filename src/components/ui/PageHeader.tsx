'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  showBack?: boolean;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  backHref,
  onBack,
  showBack = true,
  action,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex flex-col justify-center border-b border-border/70 bg-background/90 px-4 py-3.5 backdrop-blur-md transition-colors sm:px-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
              title="Geri Dön"
              aria-label="Geri Dön"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {icon && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground">
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base sm:text-lg font-bold text-foreground">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {(actions || action) && (
          <div className="flex flex-shrink-0 items-center gap-2">
            {actions || action}
          </div>
        )}
      </div>
    </div>
  );
}
