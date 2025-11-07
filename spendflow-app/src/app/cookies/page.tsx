'use client';

import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-4">
            Cookie Policy
          </h1>
          <p className="text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">1. What Are Cookies</h2>
            <p className="text-slate-300 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">2. How We Use Cookies</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Essential Cookies</h3>
                <p>Required for the website to function properly. These include:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Authentication cookies (Firebase)</li>
                  <li>Session management</li>
                  <li>Security features</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Functional Cookies</h3>
                <p>Remember your preferences and settings:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Currency selection</li>
                  <li>Language preferences</li>
                  <li>Theme settings (dark/light mode)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Analytics Cookies</h3>
                <p>Help us understand how you use our service:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Page views and navigation</li>
                  <li>Feature usage statistics</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">3. Third-Party Cookies</h2>
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-300 font-semibold">
                ✓ We only use ONE third-party service: Firebase (Google Cloud)
              </p>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Firebase is used ONLY for essential services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li><strong>Firebase Authentication</strong> - Secure login cookies (essential)</li>
              <li><strong>Firebase Firestore</strong> - Database connection (essential)</li>
              <li><strong>Firebase Hosting</strong> - Secure content delivery (essential)</li>
            </ul>
            <p className="text-slate-400 text-sm mt-4 italic">
              We do NOT use Google Analytics, Google Ads, or any other tracking/advertising services.
            </p>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">4. Managing Cookies</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Browser settings - Most browsers allow you to refuse or delete cookies</li>
              <li>Opt-out tools - Use browser extensions to block tracking cookies</li>
              <li>Privacy settings - Adjust your preferences in your account settings</li>
            </ul>
            <p className="text-amber-400 mt-4 text-sm">
              Note: Disabling essential cookies may affect the functionality of our service.
            </p>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">5. Your Consent</h2>
            <p className="text-slate-300 leading-relaxed">
              By using our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us.
            </p>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">6. Updates to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-serif text-slate-100 mb-4">7. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="text-slate-300">
              <p>Email: <a href="mailto:spendflowapp@gmail.com" className="text-amber-400 hover:text-amber-300">spendflowapp@gmail.com</a></p>
              <p className="mt-2">Or visit our <Link href="/contact" className="text-amber-400 hover:text-amber-300 underline">Contact page</Link></p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
