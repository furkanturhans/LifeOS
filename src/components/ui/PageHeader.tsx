'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppArtwork } from './AppArtwork';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocaleRender } from '@/lib/i18n/runtime';

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
  const localizeText = useLocaleRender();
  const router = useRouter();
  const pathname = usePathname();
  const artworkId = pathname.split('/').filter(Boolean).at(-1) ?? '';

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
        'sticky top-0 z-20 flex flex-col justify-center border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur-md transition-colors sm:px-6',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
              title={localizeText("Geri Dön")}
              aria-label={localizeText("Geri Dön")}
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          )}

          {icon && (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground">
              <AppArtwork id={artworkId} fallback={icon} className="h-8 w-8" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="break-words text-lg sm:text-xl font-bold text-foreground">
                {localizeText(title)}
              </h1>
              {localizeText(badge)}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {localizeText(subtitle)}
              </p>
            )}
          </div>
        </div>

        {(actions || action) && (
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            {localizeText(actions || action)}
          </div>
        )}
      </div>
    </div>
  );
}
