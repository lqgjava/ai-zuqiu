'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLanguage } from './language-provider';
import { availableLocales } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, localeNames, strings } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter locales based on search query
  const filteredLocales = availableLocales.filter(code =>
    localeNames[code].toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleSelect = (code: string) => {
    setLocale(code as any);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-medium text-slate-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] transition hover:bg-slate-950/80 hover:text-white"
      >
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
          {strings.languageSwitcher.label}
        </span>
        <span className="text-white">{localeNames[locale]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-white/10 bg-slate-950/95 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          {/* Search input */}
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                autoFocus
              />
            </div>
          </div>

          {/* Language options */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredLocales.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">
                No languages found
              </div>
            ) : (
              filteredLocales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLocaleSelect(code)}
                  className={`w-full px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                    locale === code
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{localeNames[code]}</span>
                    <span className="text-xs text-slate-500 uppercase">{code}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
