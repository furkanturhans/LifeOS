import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-xs active:opacity-95',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
      outline: 'border border-border bg-card text-foreground hover:bg-muted/60 hover:text-foreground',
      ghost: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
    };

    const sizes: Record<string, string> = {
      xs: 'h-7 px-2.5 text-xs rounded-lg font-medium',
      sm: 'h-8 px-3 text-xs rounded-lg font-medium',
      md: 'h-10 px-4 py-2 text-xs sm:text-sm rounded-xl font-medium',
      lg: 'h-11 px-5 text-sm rounded-xl font-semibold',
      icon: 'h-9 w-9 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-45',
          'cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

