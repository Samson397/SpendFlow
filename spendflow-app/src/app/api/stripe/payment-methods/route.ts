/**
 * API Route: Get Payment Methods
 *
 * GET /api/stripe/payment-methods?userId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find customer by userId
    const customers = await stripe.customers.list({
      metadata: { userId },
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json([]);
    }

    const customer = customers.data[0];

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    return NextResponse.json(paymentMethods.data);

  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
