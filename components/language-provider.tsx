'use client';

import { createContext, useContext, type ReactNode, useEffect, useMemo, useState } from 'react';
import { availableLocales, defaultLocale, localeNames, translations, type Locale, type TranslationSchema } from '@/lib/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  localeNames: Record<Locale, string>;
  strings: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem('locale') as Locale | null;
    if (storedLocale && availableLocales.includes(storedLocale)) {
      setLocaleState(storedLocale);
      return;
    }

    const browserLocale = window.navigator.language.split('-')[0] as Locale;
    if (availableLocales.includes(browserLocale)) {
      setLocaleState(browserLocale);
      return;
    }

    setLocaleState(defaultLocale);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    if (!availableLocales.includes(nextLocale)) return;
    window.localStorage.setItem('locale', nextLocale);
    setLocaleState(nextLocale);
  };

  const value = useMemo(
    () => ({ locale, setLocale, localeNames, strings: translations[locale] }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
