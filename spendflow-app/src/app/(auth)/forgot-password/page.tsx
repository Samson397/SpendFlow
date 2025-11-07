'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Forgot password form submitted, email value:', `"${email}"`);
    console.log('🔍 Email trimmed:', `"${email.trim()}"`);
    console.log('🔍 Email length:', email.trim().length);

    if (!email.trim()) {
      console.log('❌ Email is empty, showing error');
      setError('Please enter your email address');
      setResetEmailSent(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log('❌ Email format invalid, showing error');
      setError('Please enter a valid email address');
      setResetEmailSent(false);
      return;
    }

    console.log('✅ Validation passed, proceeding with password reset');

    setLoading(true);
    setError('');
    setResetEmailSent(false);

    try {
      console.log('🔄 Sending custom password reset email to:', email.trim());

      // Create reset link for our custom email
      const resetLink = `${window.location.origin}/reset-password?email=${encodeURIComponent(email.trim())}`;

      // Send custom password reset email via our API
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_password_reset',
          userEmail: email.trim(),
          userName: email.trim().split('@')[0], // Use email prefix as name
          resetLink: resetLink
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Custom password reset email sent successfully');
        setResetEmailSent(true);
        setEmail('');
      } else {
        console.log('❌ Custom password reset email failed');
        setError('Failed to send password reset email. Please try again.');
      }

    } catch (error: unknown) {
      console.error('❌ Password reset failed:', error);
      setError('An error occurred. Please try again.');
      setResetEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-128.png"
              alt="SpendFlow Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
            Reset Your Password
          </h2>
          <p className="text-slate-400 text-sm tracking-wider">
            Enter your email address and we'll send you a reset link
          </p>
          <p className="mt-4 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link href="/login" className="font-serif text-amber-400 hover:text-amber-300 tracking-wide">
              Sign in
            </Link>
          </p>
        </div>

        {/* Success Message */}
        {resetEmailSent && !error && (
          <div className="bg-green-900/20 border border-green-700/30 p-4 backdrop-blur-sm">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-300">Password reset email sent! Check your inbox and follow the instructions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/30 p-4 backdrop-blur-sm">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password Form */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-8 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-xs tracking-widest uppercase text-slate-500 mb-2 font-serif">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-amber-600 text-amber-400 bg-amber-900/10 hover:bg-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif tracking-widest uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
              </button>
            </div>
          </form>
        </div>

        {/* Quote */}
        <div className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm font-serif italic">
            &quot;Your password is the key to your financial data.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return <ForgotPasswordContent />;
}
