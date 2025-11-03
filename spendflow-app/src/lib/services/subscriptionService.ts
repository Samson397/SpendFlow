import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { firestoreQueue } from '@/lib/firebase/queue';
import {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionPayment,
  SubscriptionChange,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionResponse,
  PlanLimits,
  SubscriptionAnalytics,
  SubscriptionNotification
} from '@/types/subscription';
import { UserProfile } from '@/types';

class SubscriptionService {
  private static instance: SubscriptionService;

  // Collection references
  private plansRef = collection(db, 'subscriptionPlans');
  private subscriptionsRef = collection(db, 'userSubscriptions');
  private paymentsRef = collection(db, 'subscriptionPayments');
  private changesRef = collection(db, 'subscriptionChanges');
  private notificationsRef = collection(db, 'subscriptionNotifications');

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // ========== PLAN MANAGEMENT ==========

  /**
   * Get all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const plans: SubscriptionPlan[] = [];

    const snapshot = await getDocs(
      query(this.plansRef, where('isActive', '==', true), orderBy('price', 'asc'))
    );

    snapshot.forEach((doc) => {
      const data = doc.data();
      plans.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SubscriptionPlan);
    });

    return plans;
  }

  /**
   * Get a specific plan by ID
   */
  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    const docRef = doc(this.plansRef, planId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as SubscriptionPlan;
  }

  /**
   * Create a new subscription plan (Admin only)
   */
  async createPlan(planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.plansRef, {
      ...planData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  }

  /**
   * Update an existing plan (Admin only)
   */
  async updatePlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<void> {
    const docRef = doc(this.plansRef, planId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // ========== SUBSCRIPTION MANAGEMENT ==========

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const q = query(
      this.subscriptionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
      currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
      canceledAt: data.canceledAt?.toDate(),
      trialStart: data.trialStart?.toDate(),
      trialEnd: data.trialEnd?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserSubscription;
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(
    userId: string,
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    return await firestoreQueue.enqueue(async () => {
      const plan = await this.getPlan(request.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        throw new Error('User already has an active subscription');
      }

      const now = new Date();
      const subscriptionData: Omit<UserSubscription, 'id'> = {
        userId,
        planId: request.planId,
        status: request.trialDays ? 'trialing' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
        trialStart: request.trialDays ? now : undefined,
        trialEnd: request.trialDays
          ? new Date(now.getTime() + request.trialDays * 24 * 60 * 60 * 1000)
          : undefined,
        createdAt: now,
        updatedAt: now,
      };

      const subscriptionRef = await addDoc(this.subscriptionsRef, {
        ...subscriptionData,
        currentPeriodStart: Timestamp.fromDate(subscriptionData.currentPeriodStart),
        currentPeriodEnd: Timestamp.fromDate(subscriptionData.currentPeriodEnd),
        trialStart: subscriptionData.trialStart ? Timestamp.fromDate(subscriptionData.trialStart) : null,
        trialEnd: subscriptionData.trialEnd ? Timestamp.fromDate(subscriptionData.trialEnd) : null,
        createdAt: Timestamp.fromDate(subscriptionData.createdAt),
        updatedAt: Timestamp.fromDate(subscriptionData.updatedAt),
      });

      // Create subscription change record
      await this.createSubscriptionChange({
        userId,
        toPlanId: request.planId,
        changeType: 'reactivate',
        effectiveDate: now,
        status: 'completed',
      });

      // Update user's profile with new subscription data
      await this.updateUserProfileSubscription(userId, plan);

      const subscription: UserSubscription = {
        id: subscriptionRef.id,
        ...subscriptionData,
      };

      return {
        subscription,
        plan,
        nextBillingDate: subscription.currentPeriodEnd,
        canUpgrade: plan.tier !== 'enterprise',
        canDowngrade: plan.tier !== 'free',
      };
    });
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(
    userId: string,
    subscriptionId: string,
    updates: UpdateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    return await firestoreQueue.enqueue(async () => {
      const subscriptionRef = doc(this.subscriptionsRef, subscriptionId);
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (!subscriptionSnap.exists()) {
        throw new Error('Subscription not found');
      }

      const currentSubscription = subscriptionSnap.data() as UserSubscription;
      if (currentSubscription.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Handle plan changes
      if (updates.planId && updates.planId !== currentSubscription.planId) {
        const newPlan = await this.getPlan(updates.planId);
        if (!newPlan) {
          throw new Error('New plan not found');
        }

        const currentPlan = await this.getPlan(currentSubscription.planId);
        if (!currentPlan) {
          throw new Error('Current plan not found');
        }

        const changeType: 'upgrade' | 'downgrade' =
          this.getTierOrder(newPlan.tier) > this.getTierOrder(currentPlan.tier) ? 'upgrade' : 'downgrade';

        // Create subscription change record
        await this.createSubscriptionChange({
          userId,
          fromPlanId: currentSubscription.planId,
          toPlanId: updates.planId,
          changeType,
          effectiveDate: new Date(),
          status: 'completed',
        });

        // Update subscription
        await updateDoc(subscriptionRef, {
          planId: updates.planId,
          updatedAt: Timestamp.now(),
        });

        // Update user profile
        await this.updateUserProfileSubscription(userId, newPlan);

        const updatedSubscription = await this.getUserSubscription(userId);
        if (!updatedSubscription) {
          throw new Error('Failed to retrieve updated subscription');
        }

        return {
          subscription: updatedSubscription,
          plan: newPlan,
          nextBillingDate: updatedSubscription.currentPeriodEnd,
          canUpgrade: newPlan.tier !== 'enterprise',
          canDowngrade: newPlan.tier !== 'free',
        };
      }

      // Handle other updates (cancel, status, Stripe data, etc.)
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (updates.cancelAtPeriodEnd !== undefined) {
        updateData.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;
        if (updates.cancelAtPeriodEnd) {
          updateData.canceledAt = Timestamp.now();

          // Create subscription change record
          await this.createSubscriptionChange({
            userId,
            fromPlanId: currentSubscription.planId,
            toPlanId: currentSubscription.planId,
            changeType: 'cancel',
            effectiveDate: new Date(),
            status: 'completed',
          });
        }
      }

      if (updates.stripeSubscriptionId !== undefined) {
        updateData.stripeSubscriptionId = updates.stripeSubscriptionId;
      }

      if (updates.status !== undefined) {
        updateData.status = updates.status;
      }

      if (updates.currentPeriodEnd !== undefined) {
        updateData.currentPeriodEnd = Timestamp.fromDate(updates.currentPeriodEnd);
      }

      await updateDoc(subscriptionRef, updateData);

      const plan = await this.getPlan(currentSubscription.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const updatedSubscription = await this.getUserSubscription(userId);
      if (!updatedSubscription) {
        throw new Error('Failed to retrieve updated subscription');
      }

      return {
        subscription: updatedSubscription,
        plan,
        nextBillingDate: updatedSubscription.currentPeriodEnd,
        canUpgrade: plan.tier !== 'enterprise',
        canDowngrade: plan.tier !== 'free',
      };
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
    await this.updateSubscription(userId, subscriptionId, { cancelAtPeriodEnd: true });
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string, subscriptionId: string): Promise<SubscriptionResponse> {
    return await firestoreQueue.enqueue(async () => {
      const subscriptionRef = doc(this.subscriptionsRef, subscriptionId);
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (!subscriptionSnap.exists()) {
        throw new Error('Subscription not found');
      }

      const subscription = subscriptionSnap.data() as UserSubscription;
      if (subscription.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Build update data, excluding null/undefined values
      const updateData: any = {
        cancelAtPeriodEnd: false,
        status: 'active',
        updatedAt: Timestamp.now(),
      };

      // Filter out any undefined values (though there shouldn't be any here)
      const cleanUpdateData: any = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanUpdateData[key] = updateData[key];
        }
      });

      await updateDoc(subscriptionRef, cleanUpdateData);

      const plan = await this.getPlan(subscription.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Create subscription change record
      await this.createSubscriptionChange({
        userId,
        fromPlanId: subscription.planId,
        toPlanId: subscription.planId,
        changeType: 'reactivate',
        effectiveDate: new Date(),
        status: 'completed',
      });

      const updatedSubscription = await this.getUserSubscription(userId);
      if (!updatedSubscription) {
        throw new Error('Failed to retrieve updated subscription');
      }

      return {
        subscription: updatedSubscription,
        plan,
        nextBillingDate: updatedSubscription.currentPeriodEnd,
        canUpgrade: plan.tier !== 'enterprise',
        canDowngrade: plan.tier !== 'free',
      };
    });
  }

  // ========== PAYMENT MANAGEMENT ==========

  /**
   * Record a subscription payment
   */
  async recordPayment(paymentData: Omit<SubscriptionPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const paymentRef = await addDoc(this.paymentsRef, {
      ...paymentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return paymentRef.id;
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string, limitCount: number = 50): Promise<SubscriptionPayment[]> {
    const q = query(
      this.paymentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const payments: SubscriptionPayment[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SubscriptionPayment);
    });

    return payments;
  }

  // ========== ANALYTICS ==========

  /**
   * Get subscription analytics (Admin only)
   */
  async getAnalytics(): Promise<SubscriptionAnalytics> {
    const subscriptions = await getDocs(this.subscriptionsRef);
    const plans = await this.getPlans();

    let totalActiveSubscriptions = 0;
    let totalMRR = 0;
    let totalARR = 0;
    const subscriptionsByPlan: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 0,
      enterprise: 0,
    };

    subscriptions.forEach((doc) => {
      const subscription = doc.data() as UserSubscription;
      if (subscription.status === 'active') {
        totalActiveSubscriptions++;

        const plan = plans.find(p => p.id === subscription.planId);
        if (plan) {
          subscriptionsByPlan[plan.tier]++;

          if (plan.tier !== 'free') {
            totalMRR += plan.price;
            totalARR += plan.price * 12;
          }
        }
      }
    });

    // Calculate churn rate (simplified - would need more complex logic for real implementation)
    const totalSubscriptions = subscriptions.size;
    const inactiveSubscriptions = totalSubscriptions - totalActiveSubscriptions;
    const churnRate = totalSubscriptions > 0 ? (inactiveSubscriptions / totalSubscriptions) * 100 : 0;

    // Calculate ARPU (simplified)
    const averageRevenuePerUser = totalActiveSubscriptions > 0 ? totalMRR / totalActiveSubscriptions : 0;

    return {
      totalActiveSubscriptions,
      totalMRR,
      totalARR,
      subscriptionsByPlan,
      churnRate,
      conversionRate: 0, // Would need historical data to calculate
      averageRevenuePerUser,
      newSubscriptionsThisMonth: 0, // Would need date filtering
      canceledSubscriptionsThisMonth: 0, // Would need date filtering
    };
  }

  // ========== NOTIFICATIONS ==========

  /**
   * Create a subscription notification
   */
  async createNotification(notificationData: Omit<SubscriptionNotification, 'id' | 'createdAt'>): Promise<string> {
    const notificationRef = await addDoc(this.notificationsRef, {
      ...notificationData,
      createdAt: Timestamp.now(),
    });

    return notificationRef.id;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<SubscriptionNotification[]> {
    let q = query(
      this.notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(q, where('read', '==', false));
    }

    const snapshot = await getDocs(q);
    const notifications: SubscriptionNotification[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as SubscriptionNotification);
    });

    return notifications;
  }

  // ========== UTILITY METHODS ==========

  /**
   * Update user profile with subscription data
   */
  private async updateUserProfileSubscription(userId: string, plan: SubscriptionPlan): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const subscription = await this.getUserSubscription(userId);

    if (subscription) {
      // Build subscription data object, filtering out undefined values
      const subscriptionData: any = {
        tier: plan.tier,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        startDate: subscription.createdAt,
        planId: plan.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      };

      // Only include trialEnd if it's defined
      if (subscription.trialEnd !== undefined) {
        subscriptionData.trialEnd = subscription.trialEnd;
      }

      // Filter out any undefined values from subscriptionData
      const cleanSubscriptionData: any = {};
      Object.keys(subscriptionData).forEach(key => {
        if (subscriptionData[key] !== undefined) {
          cleanSubscriptionData[key] = subscriptionData[key];
        }
      });

      await updateDoc(userRef, {
        subscriptionTier: plan.tier,
        subscription: cleanSubscriptionData,
        features: plan.limits,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Create a subscription change record
   */
  private async createSubscriptionChange(changeData: Omit<SubscriptionChange, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const changeRef = await addDoc(this.changesRef, {
      ...changeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return changeRef.id;
  }

  /**
   * Get tier hierarchy order (for upgrade/downgrade logic)
   */
  private getTierOrder(tier: SubscriptionTier): number {
    const order = { free: 0, pro: 1, enterprise: 2 };
    return order[tier];
  }

  /**
   * Check if user can perform an action based on their plan limits
   */
  async checkPlanLimits(userId: string, action: 'addCard' | 'addTransaction'): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    const plan = await this.getPlan(subscription.planId);
    if (!plan) return false;

    // For free plan, check limits
    if (plan.tier === 'free') {
      if (action === 'addCard') {
        // Count user's cards
        const cardsRef = collection(db, 'cards');
        const cardsQuery = query(cardsRef, where('userId', '==', userId));
        const cardsSnapshot = await getDocs(cardsQuery);
        return cardsSnapshot.size < plan.limits.maxCards;
      } else if (action === 'addTransaction') {
        // Count user's transactions (simplified - would need date filtering)
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(transactionsRef, where('userId', '==', userId));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        return transactionsSnapshot.size < plan.limits.maxTransactions;
      }
    }

    // Pro and Enterprise have higher/unlimited limits
    return true;
  }

  /**
   * Get user's current plan limits
   */
  async getUserLimits(userId: string): Promise<PlanLimits> {
    const subscription = await this.getUserSubscription(userId);

    if (subscription) {
      const plan = await this.getPlan(subscription.planId);
      return plan?.limits || this.getDefaultLimits();
    }

    // Return free tier limits if no subscription
    return this.getDefaultLimits();
  }

  /**
   * Get default (free) tier limits
   */
  private getDefaultLimits(): PlanLimits {
    return {
      maxCards: 2,
      maxTransactions: 10,
      analytics: false,
      export: false,
      prioritySupport: false,
      apiAccess: false,
      teamManagement: false,
      customIntegrations: false,
    };
  }
}

export const subscriptionService = SubscriptionService.getInstance();
