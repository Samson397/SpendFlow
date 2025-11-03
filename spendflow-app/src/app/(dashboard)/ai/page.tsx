'use client';

import { AIAssistant } from '@/components/ai/AIAssistant';
import { AuthGate } from '@/components/auth/AuthGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AIAssistantContent() {
  const { tier } = useSubscription();
  const router = useRouter();

  console.log('🤖 AI Page - Subscription tier:', tier);
  console.log('🤖 AI Page - User subscription status');

  useEffect(() => {
    // Redirect free users away from AI assistant
    console.log('🔄 AI Page redirect check:', { tier, shouldRedirect: tier === 'free' });
    if (tier === 'free') {
      console.log('🚫 Redirecting free user to subscription page');
      router.replace('/subscription');
    } else {
      console.log('✅ Allowing access for tier:', tier);
    }
  }, [tier, router]);

  // Don't render anything if user is on free plan
  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-6 text-center border border-amber-500/20">
          <div className="text-amber-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-slate-100 mb-2">
            Premium Feature
          </h2>
          <p className="text-slate-400 mb-6 text-sm">
            AI Financial Assistant is available for Pro and Enterprise users. Upgrade your plan to access personalized AI insights!
          </p>
          <button
            onClick={() => router.push('/subscription')}
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-8">
          <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"></div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide text-center sm:text-left">
            AI FINANCIAL ASSISTANT
          </h1>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"></div>
          <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase text-center sm:text-left">
            Your Personal AI Money Coach - Current Tier: {tier || 'unknown'}
          </p>
        </div>

        {/* AI Assistant Component */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg h-[600px] overflow-hidden">
            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function AIAssistantPage() {
  return (
    // <AuthGate>
      <AIAssistantContent />
    // </AuthGate>
  );
}
