import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { Toaster } from '@/components/ui/use-toast';
import CookieBannerWrapper from '@/components/layout/CookieBannerWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SpendFlow - Premium Financial Management',
  description: 'Track expenses, manage cards, and gain financial insights with SpendFlow.',
  applicationName: 'SpendFlow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpendFlow',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
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
      <body className={`${inter.variable} font-sans h-full bg-slate-900 text-slate-100 antialiased`}>
        <AuthProvider>
          <SubscriptionProvider>
            <CurrencyProvider>
              <ThemeProvider>
                <CookieBannerWrapper />
                {children}
                <Toaster />
              </ThemeProvider>
            </CurrencyProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
