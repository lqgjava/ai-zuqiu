import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';

export const metadata: Metadata = {
  title: 'Qiuzhi AI | Football intelligence platform',
  description: 'Qiuzhi AI delivers World Cup insights, AI predictions, risk scoring, and parlay optimization for global football fans.',
  metadataBase: new URL('https://your-domain.com'),
  openGraph: {
    title: 'Qiuzhi AI | Football intelligence platform',
    description: 'World Cup intelligence, odds tracking, upset alerts, and parlay optimization in one premium experience.',
    url: 'https://your-domain.com',
    siteName: 'Qiuzhi AI',
    type: 'website',
    locale: 'en-US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qiuzhi AI',
    description: 'AI-driven football analysis and global match intelligence for better betting decisions.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral text-gray-900">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
