/**
 * API Route: Update Stripe Subscription
 *
 * POST /api/stripe/update-subscription
 *
 * Updates an existing subscription (upgrade/downgrade)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { subscriptionService } from '@/lib/services/subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId, updates } = await request.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: 'User ID and subscription ID required' }, { status: 400 });
    }

    // Get current subscription from our database
    const userSubscription = await subscriptionService.getUserSubscription(userId);
    if (!userSubscription || userSubscription.stripeSubscriptionId !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const updateData: Stripe.SubscriptionUpdateParams = {};

    // Handle plan changes
    if (updates.planId) {
      const newPlan = await subscriptionService.getPlan(updates.planId);
      if (!newPlan || !newPlan.stripePriceId) {
        return NextResponse.json({ error: 'New plan not found or not configured' }, { status: 400 });
      }

      // Update subscription items
      updateData.items = [{
        id: userSubscription.stripeSubscriptionId!, // This should be the subscription item ID
        price: newPlan.stripePriceId,
      }];
    }

    // Handle cancellation
    if (updates.cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: updates.cancelAtPeriodEnd,
    });

    return NextResponse.json({
      subscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000),
    });

  } catch (error: unknown) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
