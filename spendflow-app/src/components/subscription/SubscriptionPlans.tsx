'use client';

import { Crown, Check, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SubscriptionTier } from '@/types';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface PricingCardProps {
  tier: SubscriptionTier;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

function PricingCard({ tier, isPopular, isCurrentPlan }: PricingCardProps) {
  const { upgradeToTier, tier: currentTier, quotaExceeded } = useSubscription();
  const { formatAmount } = useCurrency();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Get the theme for this specific tier
  const getTierTheme = (tierName: SubscriptionTier) => {
    const themes = {
      free: {
        primary: '#6b7280', // gray-500 - very muted
        secondary: '#4b5563', // gray-600 - basic gray
        accent: '#9ca3af', // gray-400 - dull gray
        border: '#6b7280', // gray-500 - basic borders
        bg: 'border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10',
        iconBg: 'bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]',
        button: 'bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-slate-200'
      },
      pro: {
        primary: '#7c3aed', // violet-600 - vibrant purple
        secondary: '#6d28d9', // violet-700 - rich purple
        accent: '#a855f7', // violet-500 - bright purple
        border: '#6d28d9', // violet-700 - purple borders
        bg: 'border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10',
        iconBg: 'bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]',
        button: 'bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-white'
      },
      enterprise: {
        primary: '#059669', // emerald-600 - premium green
        secondary: '#047857', // emerald-700 - rich green
        accent: '#10b981', // emerald-500 - bright green
        border: '#047857', // emerald-700 - green borders
        bg: 'border-[var(--theme-accent)] bg-[var(--theme-secondary)]/10',
        iconBg: 'bg-[var(--theme-primary)]/20 text-[var(--theme-accent)]',
        button: 'bg-[var(--theme-accent)] hover:bg-[var(--theme-primary)] text-slate-900'
      }
    };
    return themes[tierName];
  };

  const tierTheme = getTierTheme(tier);

  // Helper function to get tier level for comparison
  const getTierLevel = (tierName: SubscriptionTier): number => {
    const levels = { free: 0, pro: 1, enterprise: 2 };
    return levels[tierName];
  };

  // Determine if this is an upgrade or downgrade
  const isUpgrade = getTierLevel(tier) > getTierLevel(currentTier);
  const isDowngrade = getTierLevel(tier) < getTierLevel(currentTier);

  const handleUpgrade = async () => {
    console.log('🔍 UPGRADE DEBUG:', {
      isCurrentPlan,
      isUpgrading,
      quotaExceeded,
      tier,
      currentTier
    });

    if (!isCurrentPlan && !isUpgrading) {
      console.log('✅ Upgrade conditions met, proceeding...');
      setIsUpgrading(true);
      try {
        console.log(`🚀 Attempting to ${isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'change'} to ${tier}`);
        console.log('Calling upgradeToTier with tier:', tier);
        await upgradeToTier(tier);
        console.log(`✅ Successfully ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} to ${tier}`);
        toast.success(`Successfully ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} to ${tier === 'free' ? 'Essential' : tier === 'pro' ? 'Professional' : 'Enterprise'} plan!`);
      } catch (error: unknown) {
        console.error(`❌ Failed to ${isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'change'} to ${tier}:`, error);

        // Handle quota exceeded errors specifically
        if (error instanceof Error && (error.name === 'QuotaExceededError' || error.message?.toLowerCase().includes('quota exceeded'))) {
          toast.error('Firebase quota exceeded. Subscription changes are temporarily unavailable. Please try again later.');
        } else {
          toast.error(`Failed to ${isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'change'} to ${tier === 'free' ? 'Essential' : tier === 'pro' ? 'Professional' : 'Enterprise'} plan. Please try again.`);
        }
      } finally {
        setIsUpgrading(false);
      }
    } else {
      console.log('❌ Upgrade blocked:', {
        isCurrentPlan: isCurrentPlan ? 'Already on this plan' : false,
        isUpgrading: isUpgrading ? 'Already upgrading' : false,
        quotaExceeded: quotaExceeded ? 'Quota exceeded' : false
      });
    }
  };

  const getTierIcon = (tierName: SubscriptionTier) => {
    switch (tierName) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getTierPrice = (tierName: SubscriptionTier) => {
    switch (tierName) {
      case 'free':
        return { price: 0, period: 'forever', displayName: 'Essential' };
      case 'pro':
        return { price: 4.99, period: 'per month', displayName: 'Professional' };
      case 'enterprise':
        return { price: 9.99, period: 'per month', displayName: 'Enterprise' };
      default:
        return { price: 0, period: 'forever', displayName: 'Essential' };
    }
  };

  const price = getTierPrice(tier);

  return (
    <div className={`relative p-6 sm:p-8 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${tierTheme.bg}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Crown className="h-3 w-3" />
            MOST POPULAR
          </div>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check className="h-3 w-3" />
            CURRENT PLAN
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${tierTheme.iconBg}`}>
          {getTierIcon(tier)}
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-2">
          {price.displayName}
        </h3>

        <div className="mb-4">
          <span className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
            {price.price === 0 ? 'Free' : formatAmount(price.price)}
          </span>
          {price.price > 0 && (
            <span className="text-slate-400 text-sm ml-1">
              {price.period}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {(() => {
          const tierFeatures = {
            free: [
              'Up to 2 cards',
              '100 transactions per month',
              'Basic categories',
              'Mobile app access',
              'Community support'
            ],
            pro: [
              'Up to 5 cards',
              'Unlimited transactions',
              'Custom categories',
              'Enhanced analytics & insights',
              'Data export (CSV & JSON)',
              'Basic financial calendar',
              'Email support',
              'Multi-device sync'
            ],
            enterprise: [
              'Unlimited cards',
              'Unlimited transactions',
              'Advanced categories',
              'Advanced analytics & insights',
              'All export formats',
              'Advanced financial calendar',
              'Priority phone & email support',
              'API access',
              'Team collaboration',
              'Custom integrations',
              'Dedicated account manager'
            ]
          };
          return tierFeatures[tier].map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <span className="text-slate-300 text-sm">{feature}</span>
            </li>
          ));
        })()}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={isCurrentPlan || isUpgrading || quotaExceeded}
        className={`w-full py-3 px-6 rounded-md font-semibold transition-all duration-200 ${
          isCurrentPlan
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : quotaExceeded
            ? 'bg-red-600 text-slate-200 cursor-not-allowed'
            : isUpgrading
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : isPopular
            ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg hover:shadow-xl'
            : tierTheme.button
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : quotaExceeded ? 'Quota Exceeded' : isUpgrading ? 'Upgrading...' : `${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'} to ${tier === 'free' ? 'Essential' : tier === 'pro' ? 'Professional' : 'Enterprise'}`}
      </button>
    </div>
  );
}

export function SubscriptionPlans() {
  const { tier, quotaExceeded } = useSubscription();

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-8 sm:space-y-10 md:space-y-12">
      {/* Header */}
      <div className="text-center px-2 sm:px-4">
        <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide">
          P R E M I U M   T I E R S
        </h1>
        <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Choose Your Perfect Plan</p>
        
        {/* Quota Exceeded Warning */}
        {quotaExceeded && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Firebase Quota Exceeded</span>
            </div>
            <p className="text-red-300 text-sm mt-1">
              Subscription changes are temporarily unavailable due to Firebase usage limits. Please try again later or consider upgrading your Firebase plan for higher limits.
            </p>
          </div>
        )}
      </div>

      {/* Subscription Plans Comparison */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-6 mb-8">
        <h2 className="text-xl sm:text-2xl font-serif text-slate-100 mb-6 text-center">
          Feature Comparison
        </h2>

        {/* Mobile: Card-based layout */}
        <div className="block md:hidden space-y-6">
          <div className="space-y-4">
            {[
              { name: 'Essential', tier: 'free', price: 'Free', color: 'slate' },
              { name: 'Professional', tier: 'pro', price: '$4.99/mo', color: 'violet' },
              { name: 'Enterprise', tier: 'enterprise', price: '$9.99/mo', color: 'emerald' }
            ].map((plan) => (
              <div key={plan.tier} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold text-${plan.color}-400`}>{plan.name}</h3>
                  <span className={`text-sm text-${plan.color}-300`}>{plan.price}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Card Management</span>
                    <span className={`text-sm ${plan.tier === 'free' ? 'text-slate-400' : 'text-green-400'}`}>
                      {plan.tier === 'free' ? 'Up to 2 cards' : plan.tier === 'pro' ? 'Up to 5 cards' : 'Unlimited cards'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Monthly Transactions</span>
                    <span className={`text-sm ${plan.tier === 'free' ? 'text-slate-400' : 'text-green-400'}`}>
                      {plan.tier === 'free' ? '100 transactions' : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Category Management</span>
                    <span className="text-sm text-green-400">
                      {plan.tier === 'free' ? 'Basic' : plan.tier === 'pro' ? 'Custom' : 'Advanced'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Analytics & Insights</span>
                    <span className="text-sm text-green-400">
                      {plan.tier === 'free' ? 'Basic overview' : plan.tier === 'pro' ? 'Enhanced' : 'Advanced'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Data Export</span>
                    <span className={`text-sm ${plan.tier === 'free' ? 'text-red-400' : 'text-green-400'}`}>
                      {plan.tier === 'free' ? '✗' : plan.tier === 'pro' ? 'CSV & JSON' : 'All formats'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Financial Calendar</span>
                    <span className={`text-sm ${plan.tier === 'free' ? 'text-red-400' : 'text-green-400'}`}>
                      {plan.tier === 'free' ? '✗' : plan.tier === 'pro' ? 'Basic view' : 'Advanced'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 text-sm">Support</span>
                    <span className="text-sm text-slate-400">
                      {plan.tier === 'free' ? 'Community' : plan.tier === 'pro' ? 'Email' : 'Priority'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-4 px-4 text-left text-slate-300 font-semibold">Features</th>
                <th className="py-4 px-4 text-center text-slate-300 font-semibold">
                  <div>Essential</div>
                  <div className="text-xs text-slate-500 mt-1">Free</div>
                </th>
                <th className="py-4 px-4 text-center text-slate-300 font-semibold">
                  <div>Professional</div>
                  <div className="text-xs text-amber-400 mt-1">$4.99/mo</div>
                </th>
                <th className="py-4 px-4 text-center text-slate-300 font-semibold">
                  <div>Enterprise</div>
                  <div className="text-xs text-slate-400 mt-1">$9.99/mo</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-slate-300 font-medium">Card Management</td>
                <td className="py-4 px-4 text-center text-slate-400">Up to 2 cards</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Up to 5 cards</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Unlimited cards</td>
              </tr>
              <tr className="bg-slate-800/50">
                <td className="py-4 px-4 text-slate-300 font-medium">Monthly Transactions</td>
                <td className="py-4 px-4 text-center text-slate-400">100 transactions</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Unlimited</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-slate-300 font-medium">Category Management</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Basic categories</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Custom categories</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Advanced categories</td>
              </tr>
              <tr className="bg-slate-800/50">
                <td className="py-4 px-4 text-slate-300 font-medium">Analytics & Insights</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Basic overview</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Enhanced analytics</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Advanced insights</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-slate-300 font-medium">Data Export</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-green-400">✓ CSV & JSON</td>
                <td className="py-4 px-4 text-center text-green-400">✓ All formats</td>
              </tr>
              <tr className="bg-slate-800/50">
                <td className="py-4 px-4 text-slate-300 font-medium">Financial Calendar</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Basic view</td>
                <td className="py-4 px-4 text-center text-green-400">✓ Advanced planning</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-slate-300 font-medium">Multi-Currency</td>
                <td className="py-4 px-4 text-center text-slate-400">USD only</td>
                <td className="py-4 px-4 text-center text-slate-400">USD only</td>
                <td className="py-4 px-4 text-center text-slate-400">USD only</td>
              </tr>
              <tr className="bg-slate-800/50">
                <td className="py-4 px-4 text-slate-300 font-medium">Team Features</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-slate-400">🚧 Coming soon</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-slate-300 font-medium">API Access</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-red-400">✗</td>
                <td className="py-4 px-4 text-center text-slate-400">🚧 Coming soon</td>
              </tr>
              <tr className="bg-slate-800/50">
                <td className="py-4 px-4 text-slate-300 font-medium">Support</td>
                <td className="py-4 px-4 text-center text-slate-400">Community</td>
                <td className="py-4 px-4 text-center text-slate-400">Email support</td>
                <td className="py-4 px-4 text-center text-slate-400">Priority support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
        <PricingCard
          tier="free"
          isCurrentPlan={tier === 'free'}
        />
        <PricingCard
          tier="pro"
          isPopular={true}
          isCurrentPlan={tier === 'pro'}
        />
        <PricingCard
          tier="enterprise"
          isCurrentPlan={tier === 'enterprise'}
        />
      </div>

      {/* FAQ Section */}
      <div className="text-center pt-6 sm:pt-8 md:pt-12 border-t border-slate-800 px-2 sm:px-4">
        <h3 className="text-lg sm:text-xl font-serif text-slate-100 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 text-left max-w-2xl mx-auto">
          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Can I change plans anytime?</h4>
            <p className="text-slate-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Is there a free trial?</h4>
            <p className="text-slate-400 text-sm">All plans come with a 14-day free trial. No credit card required to start.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-2">What payment methods do you accept?</h4>
            <p className="text-slate-400 text-sm">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
