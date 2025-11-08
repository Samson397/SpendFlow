import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DeepSeekInitializer } from '@/components/DeepSeekInitializer';
import { ConsentManager } from '@/components/consent/ConsentManager';

// Import DeepSeek service for AI features
import { validateEnvironment } from '@/lib/env-validation';

// Validate environment variables on server startup
validateEnvironment();

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SpendFlow - Smart Financial Management',
  description: 'Take control of your finances with SpendFlow. Track expenses, manage cards, and gain insights into your spending habits.',
  keywords: 'finance, expense tracker, budget, money management, cards',
  applicationName: 'SpendFlow',
  authors: [{ name: 'SpendFlow Team' }],
  creator: 'SpendFlow',
  publisher: 'SpendFlow',
  manifest: '/manifest.json?v=20241107',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpendFlow',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SpendFlow',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0f172a',
    'msapplication-config': '/browserconfig.xml?v=20241107',
    'msapplication-TileImage': '/icon-192.png?v=20241107',
    'theme-color': '#f59e0b',
    'color-scheme': 'dark light',
  },
  icons: {
    icon: [
      { url: '/icon-512.png?v=20241107', sizes: '512x512', type: 'image/png' },
      { url: '/icon-256.png?v=20241107', sizes: '256x256', type: 'image/png' },
      { url: '/icon-192.png?v=20241107', sizes: '192x192', type: 'image/png' },
      { url: '/icon-128.png?v=20241107', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-32x32.png?v=20241107', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=20241107', sizes: '16x16', type: 'image/png' },
      { url: '/icon-96.png?v=20241107', sizes: '96x96', type: 'image/png' },
      { url: '/logo-main.png?v=20241107', sizes: 'any', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.ico?v=20241107', sizes: 'any' },
      { url: '/icon-512.png?v=20241107', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=20241107', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192.png?v=20241107', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico?v=20241107' },
      { rel: 'icon', url: '/icon-192.png?v=20241107', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0f172a', // slate-900
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
        <ThemeProvider>
          <SubscriptionProvider>
            <AuthProvider>
              <CurrencyProvider>
                <DeepSeekInitializer />
                <ConsentManager />
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </CurrencyProvider>
            </AuthProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
