'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConsentPreferences {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  notifications: boolean;
}

export function ConsentManager() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    notifications: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error('Failed to parse consent preferences');
      }
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowDetails(false);

    // Apply preferences
    if (prefs.analytics) {
      // Enable analytics
      console.log('Analytics enabled');
    }
    if (prefs.notifications) {
      // Enable notifications
      console.log('Notifications enabled');
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      notifications: true,
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      notifications: false,
    });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-md border-t border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!showDetails ? (
            // Simple Banner
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold mb-1">We Value Your Privacy</h3>
                    <p className="text-slate-300 text-sm">
                      We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
                      By clicking "Accept All", you consent to our use of cookies.{' '}
                      <Link href="/cookies" className="text-amber-400 hover:text-amber-300 underline">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-100 font-semibold text-lg">Cookie Preferences</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-slate-100 font-medium">Essential Cookies</h4>
                      <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">Required</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Necessary for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-600"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-medium mb-1">Analytics Cookies</h4>
                    <p className="text-slate-400 text-sm">
                      Help us understand how you use our site to improve your experience.
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-medium mb-1">Marketing Cookies</h4>
                    <p className="text-slate-400 text-sm">
                      Used to deliver personalized content and advertisements.
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Notification Permission */}
                <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-medium mb-1">Push Notifications</h4>
                    <p className="text-slate-400 text-sm">
                      Receive alerts about transactions, budgets, and important updates.
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={acceptEssential}
                  className="flex-1 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
