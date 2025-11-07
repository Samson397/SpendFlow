'use client';

import { AIAssistant } from '@/components/ai/AIAssistant';
import { AuthGate } from '@/components/auth/AuthGate';
import { useSubscription } from '@/contexts/SubscriptionContext';

function AIAssistantContent() {
  const { tier } = useSubscription();

  console.log('🤖 AI Page - Subscription tier:', tier);
  console.log('🤖 AI Page - User subscription status');

  // Remove premium restriction - allow all users to access AI assistant

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
