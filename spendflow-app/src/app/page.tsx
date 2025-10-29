'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Don't show loading screen to prevent blinking during redirect
  if (loading || user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full px-4 py-6 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-slate-100 tracking-widest">
                S P E N D F L O W
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-400 hover:text-amber-400 font-serif tracking-wide transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-serif tracking-wider transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Decorative Line */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-12"></div>
            
            <h2 className="text-6xl sm:text-7xl font-serif text-slate-100 mb-6 tracking-wide">
              Manage Your Wealth
              <span className="block mt-4 text-amber-400">
                With Elegance
              </span>
            </h2>

            {/* Decorative Line */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto tracking-wide leading-relaxed">
              Experience premium financial management. Track expenses, manage cards, monitor income, and gain insights into your spending habits—all in one sophisticated platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link
                href="/signup"
                className="px-10 py-4 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 text-lg font-serif tracking-widest uppercase transition-all"
              >
                Begin Your Journey
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 border border-slate-700 text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-600/50 text-lg font-serif tracking-widest uppercase transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm hover:border-amber-600/30 transition-all">
                <div className="border-l-2 border-amber-600 pl-6">
                  <div className="w-12 h-12 bg-amber-900/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif text-slate-100 mb-3 tracking-wide">Card Management</h3>
                  <p className="text-slate-400 tracking-wide leading-relaxed">Track all your credit and debit cards with premium card displays and detailed analytics.</p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm hover:border-amber-600/30 transition-all">
                <div className="border-l-2 border-amber-600 pl-6">
                  <div className="w-12 h-12 bg-amber-900/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif text-slate-100 mb-3 tracking-wide">Smart Analytics</h3>
                  <p className="text-slate-400 tracking-wide leading-relaxed">Visualize your spending patterns with elegant charts and comprehensive insights.</p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm hover:border-amber-600/30 transition-all">
                <div className="border-l-2 border-amber-600 pl-6">
                  <div className="w-12 h-12 bg-amber-900/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif text-slate-100 mb-3 tracking-wide">Budget Tracking</h3>
                  <p className="text-slate-400 tracking-wide leading-relaxed">Set budgets, track expenses, and manage recurring payments with sophistication.</p>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="mt-24 pt-12 border-t border-slate-800">
              <div className="text-amber-400/40 text-6xl mb-4">&ldquo;</div>
              <p className="text-slate-400 text-xl font-serif italic mb-4 max-w-3xl mx-auto leading-relaxed">
                Financial excellence begins with the right tools. Experience wealth management designed for those who demand the finest.
              </p>
              <div className="text-slate-600 text-sm tracking-widest">— SPENDFLOW</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full px-4 py-8 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto text-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
            <p className="text-slate-500 font-serif tracking-wider">&copy; 2025 SpendFlow. Premium Financial Management.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
