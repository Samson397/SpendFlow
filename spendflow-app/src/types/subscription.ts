export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';

export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'canceled' | 'requires_payment_method';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  tier: SubscriptionTier;
  price: number; // Monthly price in cents
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: PlanFeature[];
  limits: PlanLimits;
  stripePriceId?: string; // Stripe price ID
  isPopular?: boolean; // For UI highlighting
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number; // For features with numeric limits
}

export interface PlanLimits {
  maxCards: number;
  maxTransactions: number;
  analytics: boolean;
  export: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  teamManagement: boolean;
  customIntegrations: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPayment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethodInfo;
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodInfo {
  id: string;
  type: 'card' | 'bank_account';
  last4?: string;
  brand?: string; // For cards: visa, mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  country?: string;
  isDefault: boolean;
}

export interface SubscriptionChange {
  id: string;
  userId: string;
  fromPlanId?: string;
  toPlanId: string;
  changeType: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';
  effectiveDate: Date;
  prorationAmount?: number; // Amount to be charged/refunded
  status: 'pending' | 'completed' | 'failed';
  stripeInvoiceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced UserProfile with subscription data
export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  startDate: Date;
  trialEnd?: Date;
  planId: string;
  stripeSubscriptionId?: string;
  features?: PlanLimits; // Add features property
}

// Analytics and reporting types
export interface SubscriptionAnalytics {
  totalActiveSubscriptions: number;
  totalMRR: number; // Monthly Recurring Revenue in cents
  totalARR: number; // Annual Recurring Revenue in cents
  subscriptionsByPlan: Record<SubscriptionTier, number>;
  churnRate: number; // Percentage
  conversionRate: number; // Free to paid conversion rate
  averageRevenuePerUser: number;
  newSubscriptionsThisMonth: number;
  canceledSubscriptionsThisMonth: number;
}

export interface SubscriptionWebhookEvent {
  id: string;
  type: string; // Stripe webhook event type
  data: any; // Stripe event data
  processed: boolean;
  processedAt?: Date;
  error?: string;
  createdAt: Date;
}

// API request/response types
export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string; // Stripe payment method ID
  trialDays?: number;
  couponCode?: string;
}

export interface UpdateSubscriptionRequest {
  planId?: string; // For plan changes
  cancelAtPeriodEnd?: boolean;
  paymentMethodId?: string; // For payment method updates
  stripeSubscriptionId?: string; // For webhook updates
  status?: SubscriptionStatus; // For webhook updates
  currentPeriodEnd?: Date; // For webhook updates
}

export interface SubscriptionResponse {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  paymentMethod?: PaymentMethodInfo;
  nextBillingDate?: Date;
  canUpgrade: boolean;
  canDowngrade: boolean;
}

// Notification types
export interface SubscriptionNotification {
  id: string;
  userId: string;
  type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'payment_failed' | 'payment_succeeded' | 'trial_ending' | 'renewal_reminder';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  emailSent?: boolean;
  createdAt: Date;
}

// Admin management types
export interface AdminSubscriptionUpdate {
  userId: string;
  planId?: string;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  effectiveDate?: Date;
  reason?: string;
}

export interface PlanManagementRequest {
  name?: string;
  displayName?: string;
  price?: number;
  features?: Partial<PlanFeature>[];
  limits?: Partial<PlanLimits>;
  stripePriceId?: string;
  isPopular?: boolean;
  isActive?: boolean;
}
