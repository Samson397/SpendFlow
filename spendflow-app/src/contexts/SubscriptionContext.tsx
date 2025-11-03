'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionTier, SubscriptionInfo, PlanLimits } from '@/types';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { usersService } from '@/lib/firebase/firestore';

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
  features: string[];
  maxCards: number;
  maxTransactions: number;
  analytics: boolean;
  export: boolean;
  prioritySupport: boolean;
}

// Map between internal tier names and display names
const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Essential',
  pro: 'Pro',
  enterprise: 'Enterprise'
};

// Default theme configurations based on tier limits
const getTierTheme = (tier: SubscriptionTier, limits: PlanLimits): ThemeConfig => {
  // Default theme configurations
  const themes: Record<SubscriptionTier, Omit<ThemeConfig, 'maxCards' | 'maxTransactions' | 'analytics' | 'export' | 'prioritySupport'>> = {
    free: {
      name: TIER_DISPLAY_NAMES.free,
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#9ca3af',
      background: '#1f2937',
      surface: '#374151',
      text: '#f3f4f6',
      textSecondary: '#d1d5db',
      border: '#6b7280',
      gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
      features: []
    },
    pro: {
      name: TIER_DISPLAY_NAMES.pro,
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#e0e7ff',
      textSecondary: '#a5b4fc',
      border: '#4f46e5',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
      features: []
    },
    enterprise: {
      name: TIER_DISPLAY_NAMES.enterprise,
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#ede9fe',
      textSecondary: '#c4b5fd',
      border: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      features: []
    }
  };

  return {
    ...themes[tier],
    maxCards: limits.maxCards,
    maxTransactions: limits.maxTransactions,
    analytics: limits.analytics,
    export: limits.export,
    prioritySupport: limits.prioritySupport,
    features: [
      `Up to ${limits.maxCards === -1 ? 'unlimited' : limits.maxCards} cards`,
      limits.maxTransactions === -1 ? 'Unlimited transactions' : `Up to ${limits.maxTransactions} transactions/month`,
      ...(limits.analytics ? ['Advanced analytics'] : []),
      ...(limits.export ? ['Data export'] : []),
      ...(limits.prioritySupport ? ['Priority support'] : []),
      ...(limits.apiAccess ? ['API access'] : []),
      ...(limits.teamManagement ? ['Team management'] : []),
      ...(limits.customIntegrations ? ['Custom integrations'] : [])
    ]
  };
};

interface SubscriptionContextType {
  tier: SubscriptionTier;
  subscription: SubscriptionInfo | null;
  theme: ThemeConfig;
  isLoading: boolean;
  quotaExceeded: boolean;
  upgradeToTier: (tier: SubscriptionTier) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  canAccessFeature: (feature: keyof ThemeConfig) => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Get default limits for current tier (fallback)
const getDefaultLimits = (tier: SubscriptionTier): PlanLimits => {
  const limits: Record<SubscriptionTier, PlanLimits> = {
    free: {
      maxCards: 2,
      maxTransactions: 10,
      analytics: false,
      export: false,
      prioritySupport: false,
      apiAccess: false,
      teamManagement: false,
      customIntegrations: false,
    },
    pro: {
      maxCards: 5,
      maxTransactions: -1, // unlimited
      analytics: true,
      export: true,
      prioritySupport: false,
      apiAccess: false,
      teamManagement: false,
      customIntegrations: false,
    },
    enterprise: {
      maxCards: -1, // unlimited
      maxTransactions: -1, // unlimited
      analytics: true,
      export: true,
      prioritySupport: true,
      apiAccess: true,
      teamManagement: true,
      customIntegrations: true,
    },
  };
  return limits[tier];
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Get current tier from subscription
  const tier: SubscriptionTier = subscription?.tier || 'free';

  // Get theme based on current subscription limits
  const theme: ThemeConfig = getTierTheme(tier, subscription?.features || getDefaultLimits(tier));

  const loadSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get user profile first to check for any mismatches
      let userProfile = null;
      try {
        userProfile = await usersService.get(user.uid);
      } catch (error) {
        console.warn('Failed to load user profile for subscription check', error);
      }

      // Try to get subscription from the service
      const userSubscription = await subscriptionService.getUserSubscription(user.uid);

      if (userSubscription) {
        // Get plan details
        const plan = await subscriptionService.getPlan(userSubscription.planId);

        if (!plan) {
          console.error('❌ [SubscriptionContext] No plan found for subscription:', userSubscription.planId);
          // Fall back to free tier if no plan found
          const freeSubscription: SubscriptionInfo = {
            tier: 'free',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            startDate: new Date(),
            planId: 'free',
            features: getDefaultLimits('free')
          };
          setSubscription(freeSubscription);
          return;
        }

        // Check if user is admin (admins can bypass maintenance mode)
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        const isAdminUser = user?.email ? adminEmails.includes(user.email) : false;

        if (!isAdminUser) {
          // For non-admin users, verify legitimate paid subscription
          // Allow enterprise access if assigned by admin (no stripe validation required)
          const hasValidEnterpriseAccess = userSubscription.status === 'active' &&
                                        (userSubscription.stripeSubscriptionId ||
                                         plan.tier === 'enterprise') && // Allow enterprise without Stripe
                                        !userSubscription.cancelAtPeriodEnd;

          console.log('🔍 [SubscriptionContext] Enterprise validation:', {
            planTier: plan.tier,
            subscriptionStatus: userSubscription.status,
            hasStripeId: !!userSubscription.stripeSubscriptionId,
            cancelAtPeriodEnd: userSubscription.cancelAtPeriodEnd,
            hasValidEnterpriseAccess,
            userEmail: user?.email
          });

          if (!hasValidEnterpriseAccess) {
            console.warn('⚠️ [SubscriptionContext] Enterprise access detected but no valid subscription found. Downgrading to free tier.');
            // Force downgrade to free tier
            const freeSubscription: SubscriptionInfo = {
              tier: 'free',
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              cancelAtPeriodEnd: false,
              startDate: new Date(),
              planId: 'free',
              features: getDefaultLimits('free')
            };
            setSubscription(freeSubscription);
            return;
          }
        } else {
          // For admin users, allow admin-assigned enterprise access without Stripe validation
          console.log('👑 [SubscriptionContext] Admin user detected, allowing enterprise access without Stripe validation');
        }

        // Map UserSubscription to SubscriptionInfo
        const subscriptionInfo: SubscriptionInfo = {
          tier: plan.tier,
          status: userSubscription.status,
          currentPeriodEnd: userSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: userSubscription.cancelAtPeriodEnd || false,
          startDate: userSubscription.currentPeriodStart,
          trialEnd: userSubscription.trialEnd,
          planId: userSubscription.planId,
          stripeSubscriptionId: userSubscription.stripeSubscriptionId,
          features: plan.limits
        };

        setSubscription(subscriptionInfo);

        // Check for any mismatches between user profile and subscription
        if (userProfile?.subscriptionTier && plan.tier &&
            userProfile.subscriptionTier !== plan.tier) {
          console.warn(`⚠️ [SubscriptionContext] User profile subscriptionTier (${userProfile.subscriptionTier}) doesn't match actual subscription (${plan.tier}). This field should not override actual subscription logic.`);
        }
      } else {
        // No subscription found, set to free tier
        const freeSubscription: SubscriptionInfo = {
          tier: 'free',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          startDate: new Date(),
          planId: 'free',
          features: getDefaultLimits('free')
        };
        setSubscription(freeSubscription);
      }

      // Reset quota exceeded flag on successful load
      setQuotaExceeded(false);
    } catch (error: unknown) {
      console.error('❌ [SubscriptionContext] Error loading subscription:', error);

      // Handle Firebase quota exceeded errors
      const isQuotaError = error instanceof Error && (
        ('code' in error && error.code === 'resource-exhausted') ||
        error.message?.includes('Quota exceeded') ||
        error.message?.includes('resource-exhausted') ||
        String(error).includes('resource-exhausted')
      );

      if (isQuotaError) {
        console.warn('⚠️ [SubscriptionContext] Firebase quota exceeded detected, setting flag');
        setQuotaExceeded(true);
        // Fallback to free tier without making more requests
        const defaultSubscription: SubscriptionInfo = {
          tier: 'free',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          startDate: new Date(),
          planId: 'free',
          features: getDefaultLimits('free')
        };
        setSubscription(defaultSubscription);
        return;
      }

      // Fallback to free tier
      const defaultSubscription: SubscriptionInfo = {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        startDate: new Date(),
        planId: 'free',
        features: getDefaultLimits('free')
      };
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [user, setSubscription, setIsLoading, setQuotaExceeded]);

  // Load subscription when user changes
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleUpgradeToTier = useCallback(async (targetTier: SubscriptionTier) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Import Firebase functions dynamically
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { getApp } = await import('firebase/app');

      const functions = getFunctions(getApp());
      const upgradeSubscriptionFn = httpsCallable(functions, 'upgradeSubscription');

      // Call Firebase function
      const result = await upgradeSubscriptionFn({ tier: targetTier });
      const data = result.data as { success: boolean; checkoutUrl?: string; sessionId?: string };

      if (data.success) {
        if (targetTier === 'free') {
          // For free tier, reload subscription data
          await loadSubscription();
          console.log('✅ [SubscriptionContext] Successfully set to free tier');
        } else if (data.checkoutUrl) {
          // For paid tiers, redirect to Stripe checkout
          console.log('✅ [SubscriptionContext] Checkout session created, redirecting to Stripe...');
          window.location.href = data.checkoutUrl;
        }
      }
    } catch (error) {
      console.error('❌ [SubscriptionContext] Error upgrading subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadSubscription, setIsLoading]);

  const handleCancelSubscription = useCallback(async () => {
    if (!user) return;

    // Prevent canceling free tier subscriptions
    if (tier === 'free') {
      throw new Error('Free tier subscriptions cannot be canceled');
    }

    try {
      setIsLoading(true);

      // Get current subscription
      const userSubscription = await subscriptionService.getUserSubscription(user.uid);
      if (!userSubscription) {
        throw new Error('No active subscription found');
      }

      await subscriptionService.cancelSubscription(user.uid, userSubscription.id);
      await loadSubscription();
    } catch (error) {
      console.error('❌ [SubscriptionContext] Error canceling subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, tier, loadSubscription, setIsLoading]);

  const handleReactivateSubscription = useCallback(async () => {
    if (!user) return;

    // Only allow reactivation for paid subscriptions
    if (tier === 'free') {
      throw new Error('Free tier subscriptions cannot be reactivated');
    }

    try {
      setIsLoading(true);

      // Get current subscription
      const userSubscription = await subscriptionService.getUserSubscription(user.uid);
      if (!userSubscription) {
        throw new Error('No active subscription found');
      }

      await subscriptionService.reactivateSubscription(user.uid, userSubscription.id);
      await loadSubscription();
    } catch (error) {
      console.error('❌ [SubscriptionContext] Error reactivating subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, tier, loadSubscription, setIsLoading]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tier,
    subscription,
    theme,
    isLoading,
    quotaExceeded,
    upgradeToTier: handleUpgradeToTier,
    cancelSubscription: handleCancelSubscription,
    reactivateSubscription: handleReactivateSubscription,
    canAccessFeature: (feature: keyof ThemeConfig) => {
      const limits = subscription?.features || getDefaultLimits(tier);
      return !!limits[feature as keyof typeof limits];
    },
    refreshSubscription: loadSubscription,
  }), [tier, subscription, theme, isLoading, quotaExceeded, handleUpgradeToTier, handleCancelSubscription, handleReactivateSubscription, loadSubscription]);

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
