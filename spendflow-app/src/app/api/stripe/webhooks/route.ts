/**
 * API Route: Stripe Webhooks
 *
 * POST /api/stripe/webhooks
 *
 * Handles incoming Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { subscriptionService } from '@/lib/services/subscriptionService';
import { PaymentStatus } from '@/types/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    await handleWebhookEvent(event);

    return NextResponse.json({ received: true });

  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle different types of Stripe webhook events
 */
async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed in our database
    await subscriptionService.createNotification({
      userId: 'system', // System notification
      type: 'subscription_created', // Generic type for webhooks
      title: 'Webhook Processed',
      message: `Processed ${event.type} webhook`,
      data: { eventId: event.id, eventType: event.type },
      read: false,
    });

  } catch (error: unknown) {
    console.error(`Error handling ${event.type}:`, error);
    throw error;
  }
}

// ========== WEBHOOK EVENT HANDLERS ==========

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription created:', subscription.id);

  // Find user by customer ID
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) {
    console.error('No userId found in customer metadata for subscription:', subscription.id);
    return;
  }

  // Find the plan by Stripe price ID
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error('No price ID found for subscription:', subscription.id);
    return;
  }

  const plans = await subscriptionService.getPlans();
  const plan = plans.find(p => p.stripePriceId === priceId);

  if (!plan) {
    console.error('No matching plan found for price ID:', priceId);
    return;
  }

  // Create subscription record in our database
  await subscriptionService.createSubscription(userId, {
    planId: plan.id,
  });

  // Send notification
  await subscriptionService.createNotification({
    userId,
    type: 'subscription_created',
    title: 'Subscription Activated',
    message: `Your ${plan.displayName} subscription has been activated.`,
    data: { planName: plan.displayName },
    read: false,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);

  // Find user by customer ID and update subscription
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) return;

  // Get current subscription from our database
  const userSubscription = await subscriptionService.getUserSubscription(userId);
  if (!userSubscription) return;

  // Update subscription status
  const updates: Partial<{
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
  }> = {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  };

  // Only add canceledAt if it exists
  if (subscription.canceled_at) {
    updates.canceledAt = new Date(subscription.canceled_at * 1000);
  }

  await subscriptionService.updateSubscription(userId, userSubscription.id, updates as any);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription deleted:', subscription.id);

  // Find user and mark subscription as canceled
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) return;

  const userSubscription = await subscriptionService.getUserSubscription(userId);
  if (!userSubscription) return;

  await subscriptionService.cancelSubscription(userId, userSubscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment succeeded for invoice:', invoice.id);

  if (!invoice.subscription) return;

  // Find user by subscription
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) return;

  // Record payment
  const paymentData: {
    userId: string;
    subscriptionId: string;
    stripePaymentIntentId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    description: string;
    invoiceUrl?: string;
    receiptUrl?: string;
  } = {
    userId,
    subscriptionId: userId, // We'll need to map this properly
    stripePaymentIntentId: (invoice.payment_intent as Stripe.PaymentIntent)?.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'succeeded' as PaymentStatus,
    description: `Subscription payment - ${new Date(invoice.created * 1000).toLocaleDateString()}`,
  };

  // Only add optional fields if they exist
  if (invoice.hosted_invoice_url) {
    paymentData.invoiceUrl = invoice.hosted_invoice_url;
  }
  if (invoice.invoice_pdf) {
    paymentData.receiptUrl = invoice.invoice_pdf;
  }

  await subscriptionService.recordPayment(paymentData);

  // Send notification
  await subscriptionService.createNotification({
    userId,
    type: 'payment_succeeded',
    title: 'Payment Successful',
    message: `Your payment of ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()} was processed successfully.`,
    data: { amount: invoice.amount_due, currency: invoice.currency },
    read: false,
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment failed for invoice:', invoice.id);

  if (!invoice.subscription) return;

  // Find user and notify about failed payment
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) return;

  // Send notification
  await subscriptionService.createNotification({
    userId,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: 'Your subscription payment failed. Please update your payment method.',
    data: { invoiceId: invoice.id },
    read: false,
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
  console.log('Trial will end for subscription:', subscription.id);

  // Find user and notify about trial ending
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.userId;

  if (!userId) return;

  const trialEndDate = new Date((subscription.trial_end as number) * 1000);

  await subscriptionService.createNotification({
    userId,
    type: 'trial_ending',
    title: 'Trial Ending Soon',
    message: `Your trial ends on ${trialEndDate.toLocaleDateString()}. Add a payment method to continue your subscription.`,
    data: { trialEndDate: trialEndDate.toISOString() },
    read: false,
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {

  // Only handle subscription mode sessions
  if (session.mode !== 'subscription') return;

  // Get user ID from metadata
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing userId or planId in checkout session metadata');
    return;
  }

  // Get the subscription from Stripe
  if (!session.subscription) {
    console.error('No subscription ID in checkout session');
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

  // Create or update subscription in our database
  const existingSubscription = await subscriptionService.getUserSubscription(userId);

  if (existingSubscription) {
    // Update existing subscription
    await subscriptionService.updateSubscription(userId, existingSubscription.id, {
      planId,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });
  } else {
    // Create new subscription
    await subscriptionService.createSubscription(userId, {
      planId,
    });
  }

  // Send success notification
  const plan = await subscriptionService.getPlan(planId);
  if (plan) {
    await subscriptionService.createNotification({
      userId,
      type: 'subscription_created',
      title: 'Welcome to ' + plan.displayName + '!',
      message: `Your ${plan.displayName} subscription is now active. Enjoy all the premium features!`,
      data: { planName: plan.displayName },
      read: false,
    });
  }
}
