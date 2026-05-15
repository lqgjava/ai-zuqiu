import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';

export const metadata: Metadata = {
  title: 'Qiuzhi AI | Football intelligence platform',
  description: 'Qiuzhi AI delivers World Cup insights, AI predictions, risk scoring, and parlay optimization for global football fans.',
  metadataBase: new URL('https://qiuzhi-ai.vercel.app'),
  openGraph: {
    title: 'Qiuzhi AI | Football intelligence platform',
    description: 'World Cup intelligence, odds tracking, upset alerts, and parlay optimization in one premium experience.',
    url: 'https://qiuzhi-ai.vercel.app',
    siteName: 'Qiuzhi AI',
    type: 'website',
    locale: 'en-US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qiuzhi AI',
    description: 'AI-driven football analysis and global match intelligence for better betting decisions.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-slate-200 antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <div className="bg-stadium-glow bg-pitch-stripes">
              {children}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
