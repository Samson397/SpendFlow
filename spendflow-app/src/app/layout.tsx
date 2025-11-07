import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  applicationName: 'SpendFlow',
  authors: [{ name: 'SpendFlow Team' }],
  creator: 'SpendFlow',
  publisher: 'SpendFlow',
  manifest: '/manifest.json?v=20241103',
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
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#f59e0b',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo-main.png', sizes: 'any', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
      <body className="h-full bg-slate-900 text-slate-100">
        <AuthProvider>
          <CurrencyProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
