'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';

export function UserMenu() {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const { strings } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="secondary" disabled>
        {strings.userMenu.loading}
      </Button>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" href="/login">
          {strings.userMenu.login}
        </Button>
        <Button href="/register">
          {strings.userMenu.register}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10 transition text-sm text-slate-200"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/30 text-primary text-xs font-semibold">
          {(user.email?.[0] || 'U').toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900 border border-white/10 shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs text-slate-400">{strings.userMenu.signedIn}</p>
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
          </div>

          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            {strings.userMenu.account}
          </Link>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            {strings.userMenu.profile}
          </Link>

          <Link
            href="/favorites"
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            {strings.userMenu.favorites}
          </Link>

          <button
            onClick={async () => {
              try {
                await signOut();
                setIsOpen(false);
              } catch (err) {
                console.error('Sign-out failed:', err);
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition border-t border-white/10 mt-2"
          >
            {strings.userMenu.logout}
          </button>
        </div>
      )}
    </div>
  );
}
