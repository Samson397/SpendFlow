'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Sticky Header */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800' : 'bg-slate-900/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="shrink-0">
              <h1 className="text-lg sm:text-2xl font-serif text-slate-100 tracking-wider">
                S P E N D F L O W
              </h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {!loading && user ? (
                <>
                  <Link
                    href="/about"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors h-[44px]"
                    aria-label="About SpendFlow"
                  >
                    About
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-medium tracking-wide transition-all rounded-md min-h-[44px] flex items-center justify-center"
                    aria-label="Go to dashboard"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/about"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors h-[44px]"
                    aria-label="About SpendFlow"
                  >
                    About
                  </Link>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors h-[44px]"
                    aria-label="Sign in"
                  >
                    Sign In
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/signup"
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-medium tracking-wide transition-all rounded-md min-h-[44px] flex items-center justify-center"
                      aria-label="Get started with SpendFlow"
                    >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Start</span>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6 sm:mb-12"></div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-100 mb-4 sm:mb-6 tracking-tight leading-tight">
                Manage Your <span className="text-amber-400 block sm:inline">Wealth With Elegance</span>
              </h2>

              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-6 sm:my-8"></div>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                Experience premium financial management. Track expenses, manage cards, monitor income, and gain insights into your spending habits—all in one sophisticated platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-6 py-3 sm:py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors text-sm sm:text-base flex items-center justify-center min-h-[48px]"
                  aria-label="Create your free account"
                >
                  Start Free Now
                </Link>
                <Link
                  href="#features"
                  className="px-6 py-3 sm:py-4 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-md transition-colors text-sm sm:text-base flex items-center justify-center min-h-[48px]"
                  aria-label="Learn more about features"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-16 md:py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4">
                Powerful Features
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  title: "Card Management",
                  description: "Track all your credit and debit cards with premium card displays and detailed analytics."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: "Smart Analytics",
                  description: "Visualize your spending patterns with elegant charts and comprehensive insights."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Budget Tracking",
                  description: "Set budgets, track expenses, and manage recurring payments with sophistication."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 sm:p-8 backdrop-blur-sm hover:border-amber-600/30 transition-all"
                >
                  <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif text-slate-100 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4 sm:mb-6">
              Ready to take control of your finances?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SpendFlow for their financial management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 sm:py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors text-sm sm:text-base flex items-center justify-center min-h-[48px]"
                aria-label="Create your free account"
              >
                Get Started for Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 sm:py-4 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-md transition-colors text-sm sm:text-base flex items-center justify-center min-h-[48px]"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <Link 
                href="/privacy" 
                className="hover:text-amber-400 transition-colors"
                aria-label="View our Privacy Policy"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                href="/terms" 
                className="hover:text-amber-400 transition-colors"
                aria-label="View our Terms of Service"
              >
                Terms of Service
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                href="/about" 
                className="hover:text-amber-400 transition-colors"
                aria-label="Learn more about SpendFlow"
              >
                About Us
              </Link>
            </div>
            
            {/* Copyright */}
            <p className="text-slate-500 text-sm sm:text-base font-serif tracking-wider text-center">
              &copy; {new Date().getFullYear()} SpendFlow. Premium Financial Management.
            </p>
            
            {/* Small print */}
            <p className="text-xs text-slate-600 text-center max-w-md mt-2">
              SpendFlow is a financial management tool. Not a bank. Banking services provided by our partner banks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
