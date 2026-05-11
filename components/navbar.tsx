'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/user-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/components/language-provider';

export function Navbar() {
  const { strings } = useLanguage();

  return (
    <header className="border-b border-neutral-dark bg-background shadow-card sticky top-0 z-50">
      <div className="main-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/" className="text-xl font-bold uppercase tracking-widest text-primary hover:text-primary-dark transition">
            {strings.navbar.brand}
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: '/', label: strings.navbar.home },
              { href: '/jingcai', label: strings.navbar.jingcai },
              { href: '/leagues', label: '📊 联赛数据' },
              { href: '/parlay', label: strings.navbar.parlay },
              { href: '/worldcup', label: strings.navbar.worldcup },
              { href: '/pricing', label: strings.navbar.pricing },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
