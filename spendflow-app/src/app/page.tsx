'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();

  // If user is logged in, redirect to dashboard
  if (!loading && user) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Simple Header - Only Login */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            <Link
              href="/login"
              className="px-6 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section with Logo */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/logo-main.png"
                  alt="SpendFlow Logo"
                  width={80}
                  height={80}
                  className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                  priority
                />
              </div>

              {/* Decorative Line */}
              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
              
              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-3 tracking-tight leading-tight">
                Your Personal <span className="text-amber-400">Financial Hub</span>
              </h1>

              {/* Decorative Line */}
              <div className="w-20 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-4"></div>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
                Track expenses, manage cards, and take control of your finances.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-base"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="px-6 py-3 border-2 border-slate-700 text-slate-300 hover:bg-slate-800/50 font-semibold rounded-lg transition-all text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-3">
                Everything You Need
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
              <p className="text-slate-400 mt-4 text-sm sm:text-base max-w-2xl mx-auto">
                Powerful features to help you manage your money
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Card Management</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Manage multiple cards with real-time balances and spending tracking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Smart Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Detailed insights with visual charts and trend analysis.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Multi-Currency</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Multiple currencies with automatic conversion.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Financial Calendar</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Visualize transactions and track recurring payments.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Secure & Private</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bank-level security with encrypted data storage.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:border-amber-600/30 transition-all">
                <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Real-Time Sync</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Instant sync across all your devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
              Join thousands managing their finances smarter with SpendFlow.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-base"
            >
              Start Free Today
            </Link>
          </div>
        </section>
      </main>

      {/* Footer with All Pages */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-serif text-slate-100 mb-4 tracking-wider">
                S P E N D F L O W
              </h3>
              <p className="text-slate-400 mb-4">
                Your personal financial management platform. Track, analyze, and optimize your spending.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-slate-100 font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-amber-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-slate-100 font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-slate-400 hover:text-amber-400 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} SpendFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
