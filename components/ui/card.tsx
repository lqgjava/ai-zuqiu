import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-lg p-6 border border-neutral-dark shadow-card transition duration-300 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
