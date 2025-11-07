'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="shrink-0">
              <h1 className="text-lg sm:text-2xl font-serif text-slate-100 tracking-wider">
                S P E N D F L O W
              </h1>
            </Link>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-2 text-sm border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 font-medium tracking-wide transition-all rounded-md"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-100 mb-6 tracking-tight leading-tight">
                About <span className="text-amber-400">SpendFlow</span>
              </h1>

              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-8"></div>
              
              <p className="text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed">
                SpendFlow is a premium financial management platform designed for individuals who demand excellence in tracking their wealth, expenses, and financial goals.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 sm:py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent mb-6"></div>
                <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-6">
                  Our Mission
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-4">
                  We believe that financial management should be elegant, intuitive, and empowering. SpendFlow was created to provide a sophisticated yet accessible platform for tracking your financial journey.
                </p>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Our mission is to help you gain complete visibility and control over your finances, enabling you to make informed decisions and achieve your financial goals with confidence.
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 p-12 rounded-lg">
                <span className="text-6xl">🎯</span>
                <h3 className="text-2xl font-serif text-slate-100 mb-4">Our Vision</h3>
                <p className="text-slate-400 leading-relaxed">
                  To become the most trusted and elegant financial management platform, empowering individuals to take control of their financial future with clarity and confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
                Our Values
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-3">Security First</h3>
                <p className="text-slate-400 leading-relaxed">
                  Your financial data is protected with enterprise-grade security. We use industry-standard encryption and secure authentication to keep your information safe.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-3">Excellence</h3>
                <p className="text-slate-400 leading-relaxed">
                  We&apos;re committed to delivering a premium experience with attention to every detail, from elegant design to powerful features.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-3">User-Centric</h3>
                <p className="text-slate-400 leading-relaxed">
                  Your needs drive our development. We continuously improve based on user feedback to create the best possible experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlight */}
        <section className="py-16 sm:py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
                What Makes Us Different
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-l-2 border-amber-600 pl-6">
                <h3 className="text-xl font-serif text-slate-100 mb-3">Premium Design</h3>
                <p className="text-slate-400 leading-relaxed">
                  Experience financial management through a beautifully crafted interface that makes tracking your wealth a pleasure, not a chore.
                </p>
              </div>

              <div className="border-l-2 border-amber-600 pl-6">
                <h3 className="text-xl font-serif text-slate-100 mb-3">Comprehensive Tracking</h3>
                <p className="text-slate-400 leading-relaxed">
                  From credit cards to debit accounts, income to expenses, recurring payments to one-time transactions—track it all in one place.
                </p>
              </div>

              <div className="border-l-2 border-amber-600 pl-6">
                <h3 className="text-xl font-serif text-slate-100 mb-3">Powerful Analytics</h3>
                <p className="text-slate-400 leading-relaxed">
                  Gain deep insights into your spending patterns with beautiful charts and comprehensive reports that help you make better financial decisions.
                </p>
              </div>

              <div className="border-l-2 border-amber-600 pl-6">
                <h3 className="text-xl font-serif text-slate-100 mb-3">Mobile Responsive</h3>
                <p className="text-slate-400 leading-relaxed">
                  Access your financial data anywhere, anytime. SpendFlow works seamlessly across all your devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-slate-100 mb-6">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join SpendFlow today and experience premium financial management designed for excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors text-base flex items-center justify-center"
              >
                Get Started for Free
              </Link>
              <Link
                href="/"
                className="px-8 py-4 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-md transition-colors text-base flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"></div>
            <p className="text-slate-500 text-sm sm:text-base font-serif tracking-wider text-center">
              &copy; {new Date().getFullYear()} SpendFlow. Premium Financial Management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
