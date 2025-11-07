'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // If user is logged in, redirect to dashboard
  if (!loading && user) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-main.png"
                alt="SpendFlow Logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="ml-2 text-lg font-serif text-slate-100">SpendFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all text-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/logo-main.png"
                  alt="SpendFlow Logo"
                  width={120}
                  height={120}
                  className="mx-auto w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
                  priority
                />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-slate-100 mb-6 tracking-tight leading-tight">
                Master Your <span className="text-amber-400">Finances</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                Take control of your money with intelligent expense tracking, smart analytics,
                and AI-powered financial insights. Your journey to financial freedom starts here.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Start Your Journey Free
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 border-2 border-slate-700 text-slate-300 hover:bg-slate-800/50 font-semibold text-lg rounded-lg transition-all"
                >
                  Explore Features
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <span className="text-amber-400 mr-2">🔒</span>
                  Bank-level security
                </div>
                <div className="flex items-center">
                  <span className="text-amber-400 mr-2">⚡</span>
                  Real-time sync
                </div>
                <div className="flex items-center">
                  <span className="text-amber-400 mr-2">🤖</span>
                  AI-powered insights
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-16 sm:py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Powerful tools designed to give you complete financial clarity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-2">Smart Card Management</h3>
                <p className="text-slate-400">Track multiple cards with real-time balances and spending limits</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-2">Advanced Analytics</h3>
                <p className="text-slate-400">Visual insights with charts, trends, and spending patterns</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-2">AI Financial Assistant</h3>
                <p className="text-slate-400">Get personalized recommendations and budgeting advice</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-linear-to-br from-amber-900/20 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands who have already taken control of their financial future
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Today
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500">
            © {new Date().getFullYear()} SpendFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
