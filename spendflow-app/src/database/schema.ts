/**
 * Firestore Database Schema for SpendFlow Subscription System
 *
 * This file defines the structure of all Firestore collections used in the
 * subscription management system.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * SUBSCRIPTION PLANS COLLECTION
 * Collection: 'subscriptionPlans'
 *
 * Stores all available subscription plans and their configurations.
 */
export interface SubscriptionPlanDocument {
  // Basic plan information
  name: string;              // Internal name (e.g., 'pro_monthly')
  displayName: string;       // User-facing name (e.g., 'Professional')
  tier: 'free' | 'pro' | 'enterprise';
  price: number;             // Price in cents (e.g., 499 for $4.99)
  currency: string;          // ISO currency code (e.g., 'usd')
  interval: 'month' | 'year'; // Billing interval

  // Plan details
  description: string;       // Short description of the plan
  isPopular?: boolean;       // Whether to highlight as "Most Popular"
  isActive: boolean;         // Whether the plan is available for purchase

  // Stripe integration
  stripePriceId?: string;    // Stripe Price ID for this plan

  // Feature limits and capabilities
  limits: {
    maxCards: number;        // -1 for unlimited
    maxTransactions: number; // -1 for unlimited
    analytics: boolean;
    export: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
    teamManagement: boolean;
    customIntegrations: boolean;
  };

  // Plan features (for UI display)
  features: Array<{
    id: string;
    name: string;
    description?: string;
    included: boolean;
    limit?: number; // For features with numeric limits
  }>;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * USER SUBSCRIPTIONS COLLECTION
 * Collection: 'userSubscriptions'
 *
 * Stores individual user subscription records.
 */
export interface UserSubscriptionDocument {
  userId: string;
  planId: string;

  // Subscription status
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';

  // Billing periods
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;

  // Cancellation settings
  cancelAtPeriodEnd: boolean;
  canceledAt?: Timestamp;

  // Trial information
  trialStart?: Timestamp;
  trialEnd?: Timestamp;

  // Stripe integration
  stripeSubscriptionId?: string;

  // Additional metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * SUBSCRIPTION PAYMENTS COLLECTION
 * Collection: 'subscriptionPayments'
 *
 * Records all payment transactions for subscriptions.
 */
export interface SubscriptionPaymentDocument {
  userId: string;
  subscriptionId: string;

  // Payment details
  amount: number;            // Amount in cents
  currency: string;          // ISO currency code

  // Payment status
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'requires_payment_method';

  // Payment method information
  paymentMethod?: {
    id: string;
    type: 'card' | 'bank_account';
    last4?: string;
    brand?: string; // For cards: visa, mastercard, etc.
    expiryMonth?: number;
    expiryYear?: number;
    country?: string;
    isDefault: boolean;
  };

  // Stripe integration
  stripePaymentIntentId?: string;

  // Transaction details
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;

  // Metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * SUBSCRIPTION CHANGES COLLECTION
 * Collection: 'subscriptionChanges'
 *
 * Tracks all subscription plan changes (upgrades, downgrades, cancellations).
 */
export interface SubscriptionChangeDocument {
  userId: string;
  fromPlanId?: string;
  toPlanId: string;

  // Change details
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';
  effectiveDate: Timestamp;

  // Billing adjustments
  prorationAmount?: number;   // Amount to be charged/refunded in cents
  stripeInvoiceId?: string;

  // Processing status
  status: 'pending' | 'completed' | 'failed';

  // Metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * SUBSCRIPTION NOTIFICATIONS COLLECTION
 * Collection: 'subscriptionNotifications'
 *
 * Stores notifications related to subscription events.
 */
export interface SubscriptionNotificationDocument {
  userId: string;

  // Notification details
  type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' |
        'payment_failed' | 'payment_succeeded' | 'trial_ending' | 'renewal_reminder';
  title: string;
  message: string;

  // Additional data
  data?: Record<string, any>;

  // Status
  read: boolean;
  emailSent?: boolean;

  // Timestamp
  createdAt: Timestamp;
}

/**
 * WEBHOOK EVENTS COLLECTION
 * Collection: 'subscriptionWebhookEvents'
 *
 * Stores incoming Stripe webhook events for processing and debugging.
 */
export interface WebhookEventDocument {
  // Webhook identification
  id: string;                // Stripe event ID
  type: string;              // Stripe event type (e.g., 'customer.subscription.updated')

  // Event data
  data: any;                 // Full Stripe event data

  // Processing status
  processed: boolean;
  processedAt?: Timestamp;

  // Error handling
  error?: string;

  // Timestamp
  createdAt: Timestamp;
}

/**
 * DEFAULT PLAN DATA
 *
 * Pre-configured subscription plans for seeding the database.
 */
export const DEFAULT_SUBSCRIPTION_PLANS: Omit<SubscriptionPlanDocument, 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'free',
    displayName: 'Essential',
    tier: 'free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    description: 'Perfect for getting started with personal finance tracking',
    isPopular: false,
    isActive: true,
    limits: {
      maxCards: 2,
      maxTransactions: 10,
      analytics: false,
      export: false,
      prioritySupport: false,
      apiAccess: false,
      teamManagement: false,
      customIntegrations: false,
    },
    features: [
      { id: 'cards', name: 'Up to 2 cards', included: true, limit: 2 },
      { id: 'transactions', name: 'Up to 10 transactions', included: true, limit: 10 },
      { id: 'analytics', name: 'Basic analytics', included: false },
      { id: 'export', name: 'Data export', included: false },
      { id: 'support', name: 'Community support', included: true },
    ],
  },
  {
    name: 'pro_monthly',
    displayName: 'Professional',
    tier: 'pro',
    price: 499, // $4.99
    currency: 'usd',
    interval: 'month',
    description: 'Advanced features for serious money managers',
    isPopular: true,
    isActive: true,
    stripePriceId: 'price_1SP7L7GsAhzrVtbVkArpTnhk', // To be replaced with actual Stripe price ID
    limits: {
      maxCards: 5,
      maxTransactions: -1, // unlimited
      analytics: true,
      export: true,
      prioritySupport: false,
      apiAccess: false,
      teamManagement: false,
      customIntegrations: false,
    },
    features: [
      { id: 'cards', name: 'Up to 5 cards', included: true, limit: 5 },
      { id: 'transactions', name: 'Unlimited transactions', included: true },
      { id: 'analytics', name: 'Advanced analytics', included: true },
      { id: 'export', name: 'Data export (CSV/PDF)', included: true },
      { id: 'support', name: 'Email support', included: true },
      { id: 'sync', name: 'Multi-device sync', included: true },
    ],
  },
  {
    name: 'enterprise_monthly',
    displayName: 'Enterprise',
    tier: 'enterprise',
    price: 999, // $9.99
    currency: 'usd',
    interval: 'month',
    description: 'Complete solution for businesses and power users',
    isPopular: false,
    isActive: true,
    stripePriceId: 'price_1SP7LbGsAhzrVtbV7MV22lr5', // To be replaced with actual Stripe price ID
    limits: {
      maxCards: -1, // unlimited
      maxTransactions: -1, // unlimited
      analytics: true,
      export: true,
      prioritySupport: true,
      apiAccess: true,
      teamManagement: true,
      customIntegrations: true,
    },
    features: [
      { id: 'cards', name: 'Unlimited cards', included: true },
      { id: 'transactions', name: 'Unlimited transactions', included: true },
      { id: 'analytics', name: 'Advanced analytics & insights', included: true },
      { id: 'export', name: 'Custom reports & export', included: true },
      { id: 'support', name: 'Priority phone & email support', included: true },
      { id: 'api', name: 'API access', included: true },
      { id: 'team', name: 'Team collaboration', included: true },
      { id: 'integrations', name: 'Custom integrations', included: true },
      { id: 'manager', name: 'Dedicated account manager', included: true },
    ],
  },
];

/**
 * INDEXES REQUIRED
 *
 * These Firestore indexes should be created for optimal query performance:
 *
 * 1. userSubscriptions: userId (ascending), createdAt (descending)
 * 2. subscriptionPayments: userId (ascending), createdAt (descending)
 * 3. subscriptionChanges: userId (ascending), createdAt (descending)
 * 4. subscriptionNotifications: userId (ascending), createdAt (descending), read (ascending)
 * 5. subscriptionPlans: isActive (ascending), price (ascending)
 *
 * Create these indexes in the Firebase Console under "Indexes" section.
 */
