import * as React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'danger';
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', href, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'default' && 'bg-primary text-slate-950 shadow-[0_0_32px_rgba(0,185,255,0.24)] hover:bg-primary/90',
      variant === 'secondary' && 'border border-primary/30 bg-slate-950/60 text-white hover:bg-slate-900/80',
      variant === 'ghost' && 'bg-transparent text-white hover:bg-primary/10',
      variant === 'danger' && 'bg-danger/20 text-danger hover:bg-danger/25',
      className,
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button };
