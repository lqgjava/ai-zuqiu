import * as React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'danger' | 'warning';
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] shadow-sm',
        variant === 'neutral' && 'bg-white/10 text-slate-100',
        variant === 'success' && 'bg-white/10 text-slate-100',
        variant === 'danger' && 'bg-red-500/15 text-red-200',
        variant === 'warning' && 'bg-white/10 text-amber-200',
        className,
      )}
      {...props}
    />
  );
}
