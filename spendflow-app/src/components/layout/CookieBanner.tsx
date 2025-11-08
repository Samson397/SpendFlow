'use client';

import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Check if user has already made a choice
      const consent = localStorage.getItem('cookieConsent');
      if (consent === null) {
        // Use setTimeout to defer the state update to the next tick
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 flex items-start gap-3">
            <div className="mt-1">
              <Cookie className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">We value your privacy</h3>
              <p className="text-sm text-slate-300 mt-1">
                We use essential cookies to make our site work. For more information, please see our{' '}
                <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={declineCookies}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
