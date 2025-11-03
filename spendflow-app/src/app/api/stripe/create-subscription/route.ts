/**
 * API Route: Create Stripe Subscription
 *
 * POST /api/stripe/create-subscription
 *
 * Creates a new subscription in Stripe and returns the client secret for payment confirmation.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { subscriptionService } from '@/lib/services/subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();

    // Verify user authentication (you might want to use Firebase Auth tokens)
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get the plan details
    const plan = await subscriptionService.getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan not configured for payments' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    const customer = await getOrCreateCustomer(userId);

    // Create subscription in Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        planId,
      },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    console.log('Subscription created:', subscription.id);
    console.log('Payment intent:', paymentIntent?.id);

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      paymentIntentId: paymentIntent?.id,
      status: subscription.status,
    });

  } catch (error: unknown) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get or create Stripe customer
 */
async function getOrCreateCustomer(userId: string, userEmail?: string): Promise<Stripe.Customer> {
  // For now, create a new customer each time
  // In production, you'd want to store and reuse customer IDs

  const customer = await stripe.customers.create({
    email: userEmail || `${userId}@example.com`, // Use actual email in production
    name: `User ${userId}`,
    metadata: {
      userId,
      firebaseUid: userId,
    },
  });

  return customer;
}
