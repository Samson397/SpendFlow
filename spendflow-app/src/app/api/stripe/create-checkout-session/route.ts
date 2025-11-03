import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { subscriptionService } from '@/lib/services/subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, cancelUrl } = await request.json();

    console.log('📋 [Checkout] Request received:', { planId, userId, cancelUrl });

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the plan details
    console.log('🔍 [Checkout] Looking up plan:', planId);
    const plan = await subscriptionService.getPlan(planId);
    if (!plan) {
      console.error('❌ [Checkout] Plan not found:', planId);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    console.log('✅ [Checkout] Plan found:', plan.displayName, plan.price, 'cents');
    console.log('✅ [Checkout] User ID:', userId);

    // Create Stripe checkout session
    console.log('💳 [Checkout] Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.displayName,
              description: plan.description,
            },
            unit_amount: plan.price, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        userId,
        planId: plan.id,
        planTier: plan.tier,
      },
    });

    console.log('✅ [Checkout] Stripe session created:', session.id);

    return NextResponse.json<{
      sessionId: string;
      url: string;
    }>({
      sessionId: session.id,
      url: session.url!,
    });

  } catch (error: any) {
    console.error('❌ [Checkout] Error creating checkout session:', error);
    console.error('❌ [Checkout] Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack?.substring(0, 500)
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to create checkout session';
    if (error.code === 'authentication_error') {
      errorMessage = 'Authentication failed - check your Stripe keys';
    } else if (error.code === 'invalid_request_error') {
      errorMessage = 'Invalid request - check plan configuration';
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
