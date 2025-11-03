import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2/https';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  isPopular?: boolean;
  isActive: boolean;
  limits: {
    maxCards: number;
    maxTransactions: number;
    analytics: boolean;
    export: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
    teamManagement: boolean;
    customIntegrations: boolean;
  };
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';
  currentPeriodStart: admin.firestore.Timestamp;
  currentPeriodEnd: admin.firestore.Timestamp;
  cancelAtPeriodEnd: boolean;
  canceledAt?: admin.firestore.Timestamp;
  trialStart?: admin.firestore.Timestamp;
  trialEnd?: admin.firestore.Timestamp;
  stripeSubscriptionId?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private db = admin.firestore();

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    const plans: SubscriptionPlan[] = [];

    const snapshot = await this.db
      .collection('subscriptionPlans')
      .where('isActive', '==', true)
      .orderBy('price', 'asc')
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      plans.push({
        id: doc.id,
        name: data.name || '',
        displayName: data.displayName || '',
        tier: data.tier || 'free',
        price: data.price || 0,
        currency: data.currency || 'usd',
        interval: data.interval || 'month',
        description: data.description || '',
        isPopular: data.isPopular || false,
        isActive: data.isActive !== false,
        limits: data.limits || {
          maxCards: 2,
          maxTransactions: 10,
          analytics: false,
          export: false,
          prioritySupport: false,
          apiAccess: false,
          teamManagement: false,
          customIntegrations: false,
        },
        features: data.features || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SubscriptionPlan);
    });

    return plans;
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    const docRef = this.db.collection('subscriptionPlans').doc(planId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) return null;

    const data = snapshot.data()!;
    return {
      id: snapshot.id,
      name: data.name || '',
      displayName: data.displayName || '',
      tier: data.tier || 'free',
      price: data.price || 0,
      currency: data.currency || 'usd',
      interval: data.interval || 'month',
      description: data.description || '',
      isPopular: data.isPopular || false,
      isActive: data.isActive !== false,
      limits: data.limits || {
        maxCards: 2,
        maxTransactions: 10,
        analytics: false,
        export: false,
        prioritySupport: false,
        apiAccess: false,
        teamManagement: false,
        customIntegrations: false,
      },
      features: data.features || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as SubscriptionPlan;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const q = this.db
      .collection('userSubscriptions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1);

    const snapshot = await q.get();
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

  async createSubscription(userId: string, planId: string): Promise<UserSubscription> {
    const plan = await this.getPlan(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const subscriptionData = {
      userId,
      planId: plan.id,
      status: 'active' as const,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    const subscriptionRef = await this.db.collection('userSubscriptions').add({
      ...subscriptionData,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(subscriptionData.currentPeriodStart),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(subscriptionData.currentPeriodEnd),
      createdAt: admin.firestore.Timestamp.fromDate(subscriptionData.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(subscriptionData.updatedAt),
    });

    // Update user's profile with subscription data
    await this.updateUserProfileSubscription(userId, plan);

    const subscription: UserSubscription = {
      id: subscriptionRef.id,
      userId: subscriptionData.userId,
      planId: subscriptionData.planId,
      status: subscriptionData.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(subscriptionData.currentPeriodStart),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(subscriptionData.currentPeriodEnd),
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      createdAt: admin.firestore.Timestamp.fromDate(subscriptionData.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(subscriptionData.updatedAt),
    };

    return subscription;
  }

  async updateSubscription(userId: string, subscriptionId: string, updates: { planId?: string }): Promise<UserSubscription> {
    const subscriptionRef = this.db.collection('userSubscriptions').doc(subscriptionId);
    const subscriptionSnap = await subscriptionRef.get();

    if (!subscriptionSnap.exists) {
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

      // Update subscription
      await subscriptionRef.update({
        planId: updates.planId,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Update user profile
      await this.updateUserProfileSubscription(userId, newPlan);

      const updatedSubscription = await this.getUserSubscription(userId);
      if (!updatedSubscription) {
        throw new Error('Failed to retrieve updated subscription');
      }

      return updatedSubscription;
    }

    const updatedSubscription = await this.getUserSubscription(userId);
    if (!updatedSubscription) {
      throw new Error('Failed to retrieve updated subscription');
    }

    return updatedSubscription;
  }

  private async updateUserProfileSubscription(userId: string, plan: SubscriptionPlan): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    const subscription = await this.getUserSubscription(userId);

    if (subscription) {
      const subscriptionData = {
        tier: plan.tier,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        startDate: subscription.createdAt,
        planId: plan.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        features: plan.limits,
      };

      await userRef.update({
        subscriptionTier: plan.tier,
        subscription: subscriptionData,
        features: plan.limits,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
  }
}

const subscriptionService = SubscriptionService.getInstance();

export const upgradeSubscription = functions.onCall(
  {
    cors: [
      {
        origin: true, // Allow all origins in development
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new functions.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tier }: { tier: 'free' | 'pro' | 'enterprise' } = request.data;
  const userId = request.auth.uid;

  if (!tier || !['free', 'pro', 'enterprise'].includes(tier)) {
    throw new functions.HttpsError('invalid-argument', 'Invalid tier parameter');
  }

  try {
    // For free tier, handle directly
    if (tier === 'free') {
      const plans = await subscriptionService.getPlans();
      const freePlan = plans.find(p => p.tier === 'free');

      if (!freePlan) {
        throw new functions.HttpsError('not-found', 'Free plan not found');
      }

      // Try to update existing subscription, or create new one
      const existingSubscription = await subscriptionService.getUserSubscription(userId);

      if (existingSubscription) {
        await subscriptionService.updateSubscription(userId, existingSubscription.id, { planId: freePlan.id });
      } else {
        await subscriptionService.createSubscription(userId, freePlan.id);
      }

      return { success: true, tier: 'free' };
    }

    // For paid tiers, create Stripe checkout session
    const plans = await subscriptionService.getPlans();
    const targetPlan = plans.find(p => p.tier === tier);

    if (!targetPlan) {
      throw new functions.HttpsError('not-found', `Plan not found for tier: ${tier}`);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetPlan.currency,
            product_data: {
              name: targetPlan.displayName,
              description: targetPlan.description,
            },
            unit_amount: targetPlan.price, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.spendflow.com'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.spendflow.com'}/subscription?canceled=true`,
      metadata: {
        userId,
        planId: targetPlan.id,
        planTier: targetPlan.tier,
      },
    });

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    };

  } catch (error: any) {
    console.error('❌ [Subscription Upgrade] Error:', error);
    throw new functions.HttpsError('internal', 'Failed to process subscription upgrade');
  }
});
