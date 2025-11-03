'use client';

import { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { usageService, UsageStats } from '@/lib/services/usageService';

export function SubscriptionManager() {
  const { tier, subscription, theme, cancelSubscription, reactivateSubscription, upgradeToTier } = useSubscription();
  const { user } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageLimits, setUsageLimits] = useState<{
    cardsNearLimit: boolean;
    transactionsNearLimit: boolean;
    cardsAtLimit: boolean;
    transactionsAtLimit: boolean;
  } | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user) return;

      try {
        setUsageLoading(true);
        const [stats, limits] = await Promise.all([
          usageService.getCurrentMonthUsage(user.uid),
          usageService.checkUsageLimits(user.uid, {
            maxCards: theme.maxCards,
            maxTransactions: theme.maxTransactions
          })
        ]);

        setUsageStats(stats);
        setUsageLimits(limits);
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setUsageLoading(false);
      }
    };

    fetchUsageData();
  }, [user, theme.maxCards, theme.maxTransactions]);

  const getUsageLimitColor = (isNearLimit: boolean, isAtLimit: boolean) => {
    if (isAtLimit) return 'text-red-400';
    if (isNearLimit) return 'text-amber-400';
    return 'text-green-400';
  };

  const getUsageLimitIcon = (isNearLimit: boolean, isAtLimit: boolean) => {
    if (isAtLimit) return <XCircle className="h-4 w-4" />;
    if (isNearLimit) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (!subscription) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400">Loading subscription details...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'canceled':
        return 'text-red-400';
      case 'past_due':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'canceled':
        return <XCircle className="h-4 w-4" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-serif text-slate-100">
                {theme.name} Plan
              </h3>
            </div>
            <div className={`flex items-center gap-2 text-sm ${getStatusColor(subscription.status)}`}>
              {getStatusIcon(subscription.status)}
              <span className="capitalize">{subscription.status.replace('_', ' ')}</span>
            </div>
          </div>

          {tier !== 'enterprise' && (
            <button
              onClick={() => upgradeToTier('enterprise')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Upgrade to Enterprise
            </button>
          )}
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-slate-400 text-sm">Current Period</div>
              <div className="text-slate-200">
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-slate-400 text-sm">Started</div>
              <div className="text-slate-200">
                {subscription.startDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-6">
          <h4 className="text-slate-300 font-semibold mb-3">Your Plan Includes:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {theme.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && tier !== 'free' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600/10 text-sm font-medium rounded-md transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold mb-1">Subscription Cancelled</h4>
                <p className="text-red-300 text-sm mb-3">
                  Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}.
                  You&apos;ll retain access until then.
                </p>
                <button
                  onClick={reactivateSubscription}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Reactivate Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-300 font-semibold">Usage This Month</h4>
          {usageLimits && (usageLimits.cardsNearLimit || usageLimits.transactionsNearLimit) && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Near limit</span>
            </div>
          )}
        </div>

        {usageLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : usageStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-serif mb-1 flex items-center justify-center gap-2 ${
                usageLimits ? getUsageLimitColor(usageLimits.cardsNearLimit, usageLimits.cardsAtLimit) : 'text-slate-100'
              }`}>
                {usageLimits && getUsageLimitIcon(usageLimits.cardsNearLimit, usageLimits.cardsAtLimit)}
                {usageStats.cardsUsed}
              </div>
              <div className="text-slate-400 text-sm">Cards Used</div>
              <div className="text-slate-500 text-xs">
                {theme.maxCards === -1 ? 'Unlimited' : `of ${theme.maxCards}`}
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-serif mb-1 flex items-center justify-center gap-2 ${
                usageLimits ? getUsageLimitColor(usageLimits.transactionsNearLimit, usageLimits.transactionsAtLimit) : 'text-slate-100'
              }`}>
                {usageLimits && getUsageLimitIcon(usageLimits.transactionsNearLimit, usageLimits.transactionsAtLimit)}
                {usageStats.transactionsCount}
              </div>
              <div className="text-slate-400 text-sm">Transactions</div>
              <div className="text-slate-500 text-xs">
                {theme.maxTransactions === -1 ? 'Unlimited' : `of ${theme.maxTransactions}`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-serif text-slate-100 mb-1">
                {usageStats.reportsGenerated}
              </div>
              <div className="text-slate-400 text-sm">Reports Generated</div>
              <div className="text-slate-500 text-xs">
                {theme.analytics ? 'Analytics enabled' : 'Upgrade for analytics'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400">Unable to load usage data</div>
          </div>
        )}

        {usageLimits && (usageLimits.cardsAtLimit || usageLimits.transactionsAtLimit) && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-md">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>You've reached your plan limits. Consider upgrading for more usage.</span>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-red-700/30 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-serif text-slate-100 mb-2">
                Cancel Subscription?
              </h3>
              <p className="text-slate-400 text-sm">
                You&apos;ll lose access to {theme.name} features at the end of your current billing period.
                You can reactivate anytime before then.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  cancelSubscription();
                  setShowCancelConfirm(false);
                }}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Yes, Cancel Subscription
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full px-6 py-3 border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
