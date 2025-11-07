'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4">
          Something Went Wrong
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Error Details (Dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-left max-w-lg mx-auto">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-slate-700 text-slate-300 hover:bg-slate-800/50 font-semibold rounded-lg transition-all"
          >
            Go Home
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12">
          <p className="text-slate-500 text-sm">
            Need help?{' '}
            <Link href="/contact" className="text-amber-400 hover:text-amber-300 underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
