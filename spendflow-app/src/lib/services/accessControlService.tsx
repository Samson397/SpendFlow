/**
 * Access Control Service - No Subscription Limits
 *
 * Since the subscription system has been removed, all users now have unlimited access
 * to all features. This service maintains the same interface for backwards compatibility.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanLimits } from '@/types';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string | undefined;
  upgradeRequired?: boolean | undefined;
  currentUsage?: number | undefined;
  limit?: number | undefined;
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
   * Since subscription system was removed, all features are now available to all users
   */
  async checkFeatureAccess(
    userId: string,
    feature: keyof PlanLimits,
    options: { currentCount?: number } = {}
  ): Promise<AccessCheckResult> {
    // All users now have unlimited access to all features
    return {
      allowed: true,
      reason: 'Unlimited access - subscription system removed',
      currentUsage: options.currentCount,
      limit: -1, // unlimited
    };
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
   * Since subscription system was removed, all users have unlimited access
   */
  async getUserLimits(userId: string): Promise<PlanLimits> {
    return {
      maxCards: -1, // unlimited
      maxTransactions: -1, // unlimited
      analytics: true,
      export: true,
      prioritySupport: true,
      apiAccess: true,
      teamManagement: true,
      customIntegrations: true,
    };
  }

  /**
   * Get user's current plan information
   * Since subscription system was removed, all users have unlimited access
   */
  async getUserPlanInfo(userId: string) {
    return {
      subscription: null,
      plan: {
        id: 'unlimited',
        displayName: 'Unlimited Access',
        tier: 'enterprise',
        price: 0,
        interval: 'forever',
        description: 'Full access to all features - subscription system removed',
        isActive: true,
        limits: {
          maxCards: -1,
          maxTransactions: -1,
          analytics: true,
          export: true,
          prioritySupport: true,
          apiAccess: true,
          teamManagement: true,
          customIntegrations: true,
        }
      }
    };
  }

  /**
   * Check if a user is an admin (bypasses all limits)
   */
  private async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // Get admin emails from environment
      const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];

      // Import usersService to check user profile
      const { usersService } = await import('../firebase/firestore');

      // Get user profile to check if they're marked as admin
      const userProfile = await usersService.get(userId);

      if (userProfile?.email && adminEmails.includes(userProfile.email)) {
        return true;
      }

      // Also check the isAdmin flag in the user profile
      return userProfile?.isAdmin === true;

    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

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

    // Check if user is admin - admins get unlimited access
    const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
    if (user.email && adminEmails.includes(user.email)) {
      return {
        allowed: true,
        reason: 'Admin access - no limits applied',
        currentUsage: options.currentCount,
        limit: -1,
      };
    }

    return accessControlService.checkFeatureAccess(user.uid, feature, options);
  };

  const canAddCard = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };

    // Check if user is admin - admins get unlimited access
    const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
    if (user.email && adminEmails.includes(user.email)) {
      return {
        allowed: true,
        reason: 'Admin access - no limits applied',
        limit: -1,
      };
    }

    return accessControlService.canAddCard(user.uid);
  };

  const canAddTransaction = async (): Promise<AccessCheckResult> => {
    if (!user) return { allowed: false, reason: 'User not authenticated' };

    // Check if user is admin - admins get unlimited access
    const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
    if (user.email && adminEmails.includes(user.email)) {
      return {
        allowed: true,
        reason: 'Admin access - no limits applied',
        limit: -1,
      };
    }

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
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        // Since subscription system was removed, all users have unlimited access
        setHasAccess(true);
        setLoading(false);
      };

      checkAccess();
    }, [user]);

    if (loading) {
      return <div>Loading...</div>; // Or your loading component
    }

    if (!hasAccess) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have access to this feature.
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Export singleton instance
export const accessControlService = AccessControlService.getInstance();
