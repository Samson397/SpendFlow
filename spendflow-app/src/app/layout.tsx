import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SpendFlow - Luxury Financial Management',
  description: 'Elegant financial tracking with multi-currency support, credit card management, and automated payments',
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-900">
      <body className={`${inter.variable} font-sans h-full`}>
        <AuthProvider>
          <CurrencyProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #f59e0b',
                },
                success: {
                  iconTheme: {
                    primary: '#f59e0b',
                    secondary: '#0f172a',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#0f172a',
                  },
                },
              }}
            />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
