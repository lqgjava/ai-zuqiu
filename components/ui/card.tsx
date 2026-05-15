import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/10 bg-surface p-6 shadow-card transition duration-300 hover:border-primary/25 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
