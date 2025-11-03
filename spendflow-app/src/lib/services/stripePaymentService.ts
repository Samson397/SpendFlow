/**
 * Stripe Payment Integration Service
 *
 * Handles Stripe payment processing, subscription management, and webhook processing
 * for the SpendFlow subscription system.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  createPaymentMethod,
  createSubscription as createStripeSubscription,
  updateSubscription as updateStripeSubscription,
  cancelSubscription as cancelStripeSubscription,
  listPaymentMethods,
  PaymentMethod,
  Subscription as StripeSubscription,
  Customer,
} from '@stripe/stripe-js';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { CreateSubscriptionRequest, UpdateSubscriptionRequest } from '@/types';

class StripePaymentService {
  private static instance: StripePaymentService;
  private stripePromise: Promise<Stripe | null>;
  private stripe: Stripe | null = null;

  private constructor() {
    // Initialize Stripe with publishable key
    this.stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }

  static getInstance(): StripePaymentService {
    if (!StripePaymentService.instance) {
      StripePaymentService.instance = new StripePaymentService();
    }
    return StripePaymentService.instance;
  }

  /**
   * Initialize Stripe instance
   */
  async initializeStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  /**
   * Create a payment method from card details
   */
  async createPaymentMethod(cardElement: any, billingDetails: any): Promise<string | null> {
    const stripe = await this.initializeStripe();
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentMethod?.id || null;
  }

  /**
   * Create a subscription with Stripe
   */
  async createSubscription(
    userId: string,
    request: CreateSubscriptionRequest
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    try {
      // Get the plan details
      const plan = await subscriptionService.getPlan(request.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (!plan.stripePriceId) {
        throw new Error('Plan does not have a Stripe price ID configured');
      }

      // Create customer in Stripe (you might want to create this earlier and store the customer ID)
      const customer = await this.createCustomer(userId);

      // Create subscription in Stripe
      const subscriptionData = {
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      };

      if (request.trialDays) {
        subscriptionData.trial_period_days = request.trialDays;
      }

      // This would be called via your backend API since it requires secret key
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: request.planId,
          subscriptionData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();

      // Create the subscription record in our database
      await subscriptionService.createSubscription(userId, request);

      return {
        subscriptionId: result.subscriptionId,
        clientSecret: result.clientSecret,
      };

    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Update a subscription (upgrade/downgrade)
   */
  async updateSubscription(
    userId: string,
    subscriptionId: string,
    request: UpdateSubscriptionRequest
  ): Promise<void> {
    try {
      // Get current subscription
      const currentSubscription = await subscriptionService.getUserSubscription(userId);
      if (!currentSubscription || currentSubscription.id !== subscriptionId) {
        throw new Error('Subscription not found');
      }

      // Update via backend API
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionId: currentSubscription.stripeSubscriptionId,
          updates: request,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Update our database
      await subscriptionService.updateSubscription(userId, subscriptionId, request);

    } catch (error) {
      console.error('Error updating Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<void> {
    try {
      // Get current subscription
      const currentSubscription = await subscriptionService.getUserSubscription(userId);
      if (!currentSubscription || currentSubscription.id !== subscriptionId) {
        throw new Error('Subscription not found');
      }

      // Cancel via backend API
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionId: currentSubscription.stripeSubscriptionId,
          cancelAtPeriodEnd,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Update our database
      await subscriptionService.cancelSubscription(userId, subscriptionId);

    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/stripe/payment-methods?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Create or retrieve Stripe customer
   */
  private async createCustomer(userId: string): Promise<Customer> {
    // This would typically be done via your backend API
    // For now, we'll assume the customer is created when needed
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    return await response.json();
  }

  /**
   * Confirm payment for subscription
   */
  async confirmPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    const stripe = await this.initializeStripe();
    if (!stripe) {
      return { success: false, error: 'Stripe not initialized' };
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    try {
      // Verify webhook signature (this should be done in your backend)
      const event = JSON.parse(rawBody);

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // ========== WEBHOOK HANDLERS ==========

  private async handleSubscriptionCreated(stripeSubscription: StripeSubscription): Promise<void> {
    // Update subscription status in our database
    console.log('Subscription created:', stripeSubscription.id);
    // Implementation depends on how you map Stripe subscriptions to your users
  }

  private async handleSubscriptionUpdated(stripeSubscription: StripeSubscription): Promise<void> {
    // Update subscription details in our database
    console.log('Subscription updated:', stripeSubscription.id);
  }

  private async handleSubscriptionDeleted(stripeSubscription: StripeSubscription): Promise<void> {
    // Mark subscription as canceled in our database
    console.log('Subscription deleted:', stripeSubscription.id);
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Record successful payment
    console.log('Payment succeeded for invoice:', invoice.id);

    if (invoice.subscription) {
      // Record payment in our database
      await subscriptionService.recordPayment({
        userId: 'user-from-subscription-mapping', // You'll need to map this
        subscriptionId: 'subscription-from-mapping', // You'll need to map this
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'succeeded',
        description: `Subscription payment for ${new Date(invoice.created * 1000).toLocaleDateString()}`,
      });
    }
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);

    // You might want to notify the user, update subscription status, etc.
  }
}

export const stripePaymentService = StripePaymentService.getInstance();
