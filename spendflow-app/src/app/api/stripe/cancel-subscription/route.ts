/**
 * API Route: Cancel Stripe Subscription
 *
 * POST /api/stripe/cancel-subscription
 *
 * Cancels an existing subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { subscriptionService } from '@/lib/services/subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId, cancelAtPeriodEnd = true } = await request.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: 'User ID and subscription ID required' }, { status: 400 });
    }

    // Get current subscription from our database
    const userSubscription = await subscriptionService.getUserSubscription(userId);
    if (!userSubscription || userSubscription.stripeSubscriptionId !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let subscription: Stripe.Subscription;

    if (cancelAtPeriodEnd) {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
      currentPeriodEnd: subscription.current_period_end,
    });

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
