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
      variant === 'default' &&
        'bg-primary text-gray-950 shadow-[0_0_24px_rgba(0,185,255,0.2)] hover:bg-primary-light hover:shadow-[0_0_40px_rgba(0,185,255,0.35)]',
      variant === 'secondary' &&
        'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/20',
      variant === 'ghost' &&
        'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
      variant === 'danger' &&
        'bg-red-500/10 text-red-400 hover:bg-red-500/20',
      className,
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {props.children}
        </Link>
      );
    }

    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button };
