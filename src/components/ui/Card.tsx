'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

export function Card({
  className,
  hover = false,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/70 bg-card text-card-foreground shadow-[0_2px_12px_-6px_rgba(15,23,42,0.12)] transition-colors',
        hover && 'hover:border-border/80 hover:bg-muted/30',
        interactive && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base sm:text-lg font-semibold leading-snug tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs sm:text-sm text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 sm:p-6 pt-0', className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-border/40 mt-4', className)}
      {...props}
    />
  );
}
