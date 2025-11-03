'use client';

import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import { Mail, MessageSquare, Clock, Shield, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
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
                href="/about"
                className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                About
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
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-slate-100 mb-6 tracking-tight leading-tight">
                Get in <span className="text-amber-400">Touch</span>
              </h1>

              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-8"></div>

              <p className="text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
                Have questions about SpendFlow? Need help with your account? We're here to help you succeed with your financial goals.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">24-48 Hours</h3>
                <p className="text-slate-400 text-sm">Average response time</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Secure</h3>
                <p className="text-slate-400 text-sm">Your data is protected</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-serif text-slate-100 mb-2">Personal</h3>
                <p className="text-slate-400 text-sm">Direct support from our team</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 sm:py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactForm />
          </div>
        </section>

        {/* Alternative Contact Methods */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
                Other Ways to Reach Us
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Mail className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-3">Email Support</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  For technical issues, billing questions, or general inquiries, you can also email us directly.
                </p>
                <a
                  href="mailto:support@spendflow.com"
                  className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  support@spendflow.com
                </a>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                <div className="w-12 h-12 bg-amber-900/20 rounded-lg flex items-center justify-center mb-6">
                  <MessageSquare className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-3">Live Chat</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Need immediate assistance? Our live chat support is available during business hours.
                </p>
                <span className="text-slate-500 text-sm">
                  Available 9 AM - 6 PM EST, Monday - Friday
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
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
