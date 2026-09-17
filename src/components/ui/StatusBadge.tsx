import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Lock, Info, Sparkles } from 'lucide-react';

export type StatusType =
  | 'open'
  | 'bidding'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'verified'
  | 'locked'
  | 'active'
  | 'draft';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, className, size = 'sm' }: StatusBadgeProps) {
  const configs: Record<StatusType, { labelTr: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
    open: {
      labelTr: 'Açık Talep',
      icon: <Clock className="h-3 w-3" />,
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
    bidding: {
      labelTr: 'Teklif Bekleniyor',
      icon: <Sparkles className="h-3 w-3 text-amber-500" />,
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/25',
    },
    pending: {
      labelTr: 'İnceleniyor',
      icon: <Clock className="h-3 w-3" />,
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/25',
    },
    accepted: {
      labelTr: 'Kabul Edildi',
      icon: <CheckCircle2 className="h-3 w-3" />,
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/25',
    },
    completed: {
      labelTr: 'Tamamlandı',
      icon: <CheckCircle2 className="h-3 w-3" />,
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/25',
    },
    verified: {
      labelTr: 'Doğrulandı',
      icon: <CheckCircle2 className="h-3 w-3" />,
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/25',
    },
    active: {
      labelTr: 'Aktif',
      icon: <CheckCircle2 className="h-3 w-3" />,
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/25',
    },
    cancelled: {
      labelTr: 'İptal Edildi',
      icon: <XCircle className="h-3 w-3" />,
      bg: 'bg-muted/80',
      text: 'text-muted-foreground',
      border: 'border-border',
    },
    rejected: {
      labelTr: 'Reddedildi',
      icon: <AlertTriangle className="h-3 w-3" />,
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      border: 'border-destructive/20',
    },
    locked: {
      labelTr: 'Çok Yakında',
      icon: <Lock className="h-3 w-3" />,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
    },
    draft: {
      labelTr: 'Taslak',
      icon: <Info className="h-3 w-3" />,
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
    },
  };

  const config = configs[status] || configs.open;
  const displayLabel = label || config.labelTr;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        config.bg,
        config.text,
        config.border,
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
}
