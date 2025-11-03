/**
 * Access Control Service for Subscription-Based Features
 *
 * This service provides utilities to check user permissions, enforce subscription limits,
 * and manage feature access based on the user's current subscription plan.
 */

import { useState, useEffect } from 'react';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PlanLimits } from '@/types';

// Get default limits for current tier (fallback)
const getDefaultLimits = (tier: string): PlanLimits => {
  const limits: Record<string, PlanLimits> = {
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
  return limits[tier] || limits.free;
};

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
}

export interface FeatureAccessOptions {
  userId?: string;
  feature: keyof PlanLimits;
  currentCount?: number;
  showUpgradePrompt?: boolean;
}

/**
 * Core access control service class
 */
class AccessControlService {
  private static instance: AccessControlService;

  private constructor() {}

  static getInstance(): AccessControlService {
    if (!AccessControlService.instance) {
      AccessControlService.instance = new AccessControlService();
    }
    return AccessControlService.instance;
  }

  /**
   * Check if a user can access a specific feature
   */
  async checkFeatureAccess(
    userId: string,
    feature: keyof PlanLimits,
    options: { currentCount?: number } = {}
  ): Promise<AccessCheckResult> {
    try {
      // Get user's subscription limits
      const userLimits = await subscriptionService.getUserLimits(userId);

      // Check if the feature is enabled for this plan
      if (!userLimits[feature]) {
        return {
          allowed: false,
          reason: `This feature is not available on your current plan`,
          upgradeRequired: true,
        };
      }

      // For count-based limits, check current usage
      if (options.currentCount !== undefined && typeof userLimits[feature] === 'number') {
        const limit = userLimits[feature] as number;

        // Unlimited (-1) or not yet reached limit
        if (limit === -1 || options.currentCount < limit) {
          return {
            allowed: true,
            currentUsage: options.currentCount,
            limit: limit === -1 ? undefined : limit,
          };
        }

        // Limit reached
        return {
          allowed: false,
          reason: `You've reached your plan limit of ${limit} ${feature}`,
          upgradeRequired: true,
          currentUsage: options.currentCount,
          limit,
        };
      }

      return { allowed: true };

    } catch (error) {
      console.error('Error checking feature access:', error);
      // Default to allowing access on error to avoid blocking users
      return { allowed: true, reason: 'Unable to verify access, proceeding...' };
    }
  }

  /**
   * Check if user can add a new card
   */
  async canAddCard(userId: string): Promise<AccessCheckResult> {
    // Get current card count (this would need to be implemented based on your card storage)
    const currentCardCount = await this.getCurrentCardCount(userId);

    return this.checkFeatureAccess(userId, 'maxCards', {
      currentCount: currentCardCount
    });
  }

  /**
   * Check if user can add a new transaction
   */
  async canAddTransaction(userId: string): Promise<AccessCheckResult> {
    // Get current transaction count (this would need to be implemented based on your transaction storage)
    const currentTransactionCount = await this.getCurrentTransactionCount(userId);

    return this.checkFeatureAccess(userId, 'maxTransactions', {
      currentCount: currentTransactionCount
    });
  }

  /**
   * Check if user can export data
   */
  async canExportData(userId: string): Promise<AccessCheckResult> {
    return this.checkFeatureAccess(userId, 'export');
  }

  /**
   * Check if user can access analytics
   */
  async canAccessAnalytics(userId: string): Promise<AccessCheckResult> {
    return this.checkFeatureAccess(userId, 'analytics');
  }

  /**
   * Check if user can access API
   */
  async canAccessAPI(userId: string): Promise<AccessCheckResult> {
    return this.checkFeatureAccess(userId, 'apiAccess');
  }

  /**
   * Check if user has priority support
   */
  async hasPrioritySupport(userId: string): Promise<boolean> {
    const result = await this.checkFeatureAccess(userId, 'prioritySupport');
    return result.allowed;
  }

  /**
   * Get user's current plan limits
   */
  async getUserLimits(userId: string): Promise<PlanLimits> {
    return subscriptionService.getUserLimits(userId);
  }

  /**
   * Get user's current plan information
   */
  async getUserPlanInfo(userId: string) {
    const subscription = await subscriptionService.getUserSubscription(userId);
    if (!subscription) {
      return null;
    }

    const plan = await subscriptionService.getPlan(subscription.planId);
    return {
      subscription,
      plan,
    };
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Get current card count for a user
   * This is a placeholder - implement based on your card storage system
   */
  private async getCurrentCardCount(userId: string): Promise<number> {
    try {
      // Import cardsService to avoid circular dependency
      const { cardsService } = await import('../firebase/firestore');
      const userCards = await cardsService.getByUserId(userId);
      return userCards.length;
    } catch (error) {
      console.error('Error getting card count:', error);
      return 0;
    }
  }

  /**
   * Get current transaction count for a user
   * This is a placeholder - implement based on your transaction storage system
   */
  private async getCurrentTransactionCount(userId: string): Promise<number> {
    try {
      // Import transactionsService to avoid circular dependency
      const { transactionsService } = await import('../firebase/firestore');
      const userTransactions = await transactionsService.getByUserId(userId);
      return userTransactions.length;
    } catch (error) {
      console.error('Error getting transaction count:', error);
      return 0;
    }
  }
}

/**
 * React hook for accessing subscription-based permissions
 */
export function useAccessControl() {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscription();

  const checkFeatureAccess = async (
    feature: keyof PlanLimits,
    options: { currentCount?: number } = {}
  ): Promise<AccessCheckResult> => {
    if (!user) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    return accessControlService.checkFeatureAccess(user.uid, feature, options);
  };

  const canAddCard = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };
    return accessControlService.canAddCard(user.uid);
  };

  const canAddTransaction = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };
    return accessControlService.canAddTransaction(user.uid);
  };

  const canExportData = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };
    return accessControlService.canExportData(user.uid);
  };

  const canAccessAnalytics = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };
    return accessControlService.canAccessAnalytics(user.uid);
  };

  const canAccessAPI = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };
    return accessControlService.canAccessAPI(user.uid);
  };

  const hasPrioritySupport = async (): Promise<boolean> => {
    if (!user) return false;
    return accessControlService.hasPrioritySupport(user.uid);
  };

  return {
    checkFeatureAccess,
    canAddCard,
    canAddTransaction,
    canExportData,
    canAccessAnalytics,
    canAccessAPI,
    hasPrioritySupport,
    canAccessFeature, // From subscription context
  };
}

/**
 * Higher-order component for protecting routes/features
 */
export function withSubscriptionCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFeature?: keyof PlanLimits
) {
  return function SubscriptionProtectedComponent(props: P) {
    const { user } = useAuth();
    const { tier, subscription } = useSubscription();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        if (!requiredFeature) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check if the feature is available in the current subscription
        const limits = subscription?.features || getDefaultLimits(tier);
        const canAccess = !!limits[requiredFeature as keyof typeof limits];
        setHasAccess(canAccess);
        setLoading(false);
      };

      checkAccess();
    }, [user, requiredFeature, tier, subscription]);

    if (loading) {
      return <div>Loading...</div>; // Or your loading component
    }

    if (!hasAccess) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
          <p className="text-gray-600 mb-4">
            This feature requires a higher subscription plan.
          </p>
          {/* Add upgrade button/component here */}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Export singleton instance
export const accessControlService = AccessControlService.getInstance();
