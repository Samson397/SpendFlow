'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

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
                Complete <span className="text-amber-400 block sm:inline">Financial Control</span>
              </h2>

              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-6 sm:my-8"></div>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                Master your finances with enterprise-grade tools. Track every transaction, manage multiple cards, analyze spending patterns, export data, and scale from personal finance to business accounting—all in one powerful platform.
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
                Enterprise-Grade Financial Management
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
              <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
                From personal finance to business accounting - SpendFlow scales with your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  title: "Advanced Card Management",
                  description: "Manage unlimited cards with real-time balances, premium displays, and detailed transaction tracking per card."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: "Professional Analytics",
                  description: "Comprehensive spending insights, category breakdowns, monthly comparisons, and predictive analytics."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Multi-Currency Support",
                  description: "Handle multiple currencies with real-time conversion, custom formatting, and international transaction support."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: "Financial Calendar",
                  description: "Visual timeline of all transactions, recurring payments, and financial events with interactive planning tools."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: "Data Export & Backup",
                  description: "Export transactions, cards, and financial summaries in CSV/JSON formats for accounting and compliance."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Team Collaboration",
                  description: "Multi-user access, role-based permissions, and collaborative financial management for businesses."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Enterprise Security",
                  description: "Bank-level security with admin controls, audit trails, real-time monitoring, and compliance features."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Real-Time Sync",
                  description: "Instant synchronization across devices with live activity tracking, presence monitoring, and push notifications."
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: "Premium Support",
                  description: "24/7 priority support, dedicated account management, custom integrations, and white-label solutions."
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
        <section className="py-16 sm:py-20 bg-linear-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4 sm:mb-6">
              Start Your Financial Journey Today
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Choose your plan and unlock the full power of professional financial management. Scale from personal finance to enterprise accounting seamlessly.
            </p>
            
            {/* Pricing Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <Link
                href="/signup?plan=free"
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300 hover:shadow-lg group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-slate-500 transition-colors">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif text-slate-100 mb-2 group-hover:text-slate-200 transition-colors">Essential</h3>
                  <div className="text-2xl font-bold text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">Free</div>
                  <p className="text-sm text-slate-400">Perfect for getting started</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-500">Click to select</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/signup?plan=professional"
                className="bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-orange-500/20 border-2 border-amber-500 rounded-xl p-6 relative shadow-lg hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-900 px-4 py-2 text-sm font-black rounded-full shadow-xl border-2 border-white/20 backdrop-blur-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-lg">⭐</span>
                      <span className="font-extrabold tracking-wide">MOST POPULAR</span>
                      <span className="text-lg">⭐</span>
                    </span>
                  </div>
                </div>
                <div className="text-center pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-amber-400/50 transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif text-slate-100 mb-2 font-bold group-hover:text-amber-100 transition-colors">Professional</h3>
                  <div className="text-3xl font-black text-amber-400 mb-1 group-hover:text-amber-300 transition-colors">$4.99<span className="text-lg text-amber-300">/mo</span></div>
                  <p className="text-sm text-slate-300 font-medium mb-3">Advanced features & analytics</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full">
                    <span className="text-xs text-amber-400 font-bold">🔥 BEST VALUE</span>
                  </div>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-amber-400 font-semibold">Click to start</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/signup?plan=enterprise"
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all duration-300 hover:shadow-lg group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-slate-500 transition-colors">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif text-slate-100 mb-2 group-hover:text-slate-200 transition-colors">Enterprise</h3>
                  <div className="text-2xl font-bold text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">$9.99<span className="text-sm">/mo</span></div>
                  <p className="text-sm text-slate-400">Complete business solution</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-500">Click to select</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center justify-center min-h-[48px] shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Start with Professional plan"
              >
                🚀 Start Professional Plan - $4.99/mo
              </Link>
              <button
                onClick={() => setShowComparison(true)}
                className="px-8 py-3 sm:py-4 border-2 border-amber-500 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center justify-center min-h-[48px] hover:border-amber-400"
              >
                📊 Compare All Plans
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Plan Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-800 flex-shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 mb-2">
                    📊 Plan Comparison
                  </h2>
                  <p className="text-slate-400">Choose the perfect plan for your financial journey</p>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Header Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Features</h3>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="font-serif text-slate-100 mb-1">Essential</h4>
                        <div className="text-2xl font-bold text-slate-400 mb-2">Free</div>
                        <Link
                          href="/signup?plan=free"
                          onClick={() => setShowComparison(false)}
                          className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          Get Started
                        </Link>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-orange-500/20 border-2 border-amber-500 rounded-lg text-center relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-3 py-1 text-xs font-black rounded-full">
                            ⭐ MOST POPULAR
                          </span>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 mt-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <h4 className="font-serif text-slate-100 mb-1">Professional</h4>
                        <div className="text-2xl font-bold text-amber-400 mb-2">$4.99<span className="text-sm">/mo</span></div>
                        <Link
                          href="/signup?plan=professional"
                          onClick={() => setShowComparison(false)}
                          className="inline-block px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          🚀 Start Now
                        </Link>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-serif text-slate-100 mb-1">Enterprise</h4>
                        <div className="text-2xl font-bold text-slate-400 mb-2">$9.99<span className="text-sm">/mo</span></div>
                        <Link
                          href="/signup?plan=enterprise"
                          onClick={() => setShowComparison(false)}
                          className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          Contact Sales
                        </Link>
                      </div>
                    </div>

                    {/* Feature Rows */}
                    <div className="space-y-2">
                      {/* Card Management */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Card Management</div>
                        <div className="text-center text-green-400">✓ Up to 2 cards</div>
                        <div className="text-center text-green-400">✓ Up to 5 cards</div>
                        <div className="text-center text-green-400">✓ Unlimited cards</div>
                      </div>

                      {/* Transactions */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Monthly Transactions</div>
                        <div className="text-center text-slate-400">100 transactions</div>
                        <div className="text-center text-green-400">✓ Unlimited</div>
                        <div className="text-center text-green-400">✓ Unlimited</div>
                      </div>

                      {/* Categories */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Category Management</div>
                        <div className="text-center text-green-400">✓ Basic categories</div>
                        <div className="text-center text-green-400">✓ Custom categories</div>
                        <div className="text-center text-green-400">✓ Advanced categories</div>
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Analytics & Insights</div>
                        <div className="text-center text-green-400">✓ Basic overview</div>
                        <div className="text-center text-green-400">✓ Enhanced analytics</div>
                        <div className="text-center text-green-400">✓ Advanced insights</div>
                      </div>

                      {/* Data Export */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Data Export</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-green-400">✓ CSV & JSON</div>
                        <div className="text-center text-green-400">✓ All formats</div>
                      </div>

                      {/* Multi-Currency */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Multi-Currency</div>
                        <div className="text-center text-slate-400">USD only</div>
                        <div className="text-center text-slate-400">USD only</div>
                        <div className="text-center text-slate-400">USD only</div>
                      </div>

                      {/* Financial Calendar */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Financial Calendar</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-green-400">✓ Basic view</div>
                        <div className="text-center text-green-400">✓ Advanced planning</div>
                      </div>

                      {/* Team Collaboration */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">Team Features</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-slate-400">🚧 Coming soon</div>
                      </div>

                      {/* API Access */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-800">
                        <div className="text-slate-300 font-medium">API Access</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-red-400">✗</div>
                        <div className="text-center text-slate-400">🚧 Coming soon</div>
                      </div>

                      {/* Support */}
                      <div className="grid grid-cols-4 gap-4 py-3">
                        <div className="text-slate-300 font-medium">Support</div>
                        <div className="text-center text-slate-400">Community</div>
                        <div className="text-center text-slate-400">Email support</div>
                        <div className="text-center text-slate-400">Priority support</div>
                      </div>

                      {/* Custom Integrations */}
                      <div className="grid grid-cols-4 gap-4 py-3">
                        <div className="text-slate-300 font-medium">Custom Integrations</div>
                        <div className="text-center text-red-400">✗</div>
                      <div className="text-center text-red-400">✗</div>
                      <div className="text-center text-slate-400">🚧 Coming soon</div>
                        <div className="text-center text-green-400">✓ White-label options</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="border-t border-slate-800 p-6 sm:p-8 flex-shrink-0">
                {/* Coming Soon Features */}
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-lg">🚀</span>
                    Coming Soon
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Multi-currency support
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Team collaboration
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      API access & integrations
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Advanced priority support
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-4 text-center">
                  All plans include secure data encryption, mobile access, and automatic backups
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/signup?plan=professional"
                    onClick={() => setShowComparison(false)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    🚀 Choose Professional Plan
                  </Link>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="px-6 py-3 border border-slate-600 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Close Comparison
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
