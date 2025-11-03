/**
 * API Route: Get/Create Stripe Customer
 *
 * POST /api/stripe/create-customer
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/firebase/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user data from Firebase Auth
    const user = await auth.getUser(userId);

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return NextResponse.json(existingCustomers.data[0]);
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.displayName || undefined,
      metadata: {
        userId,
        firebaseUid: user.uid,
      },
    });

    return NextResponse.json(customer);

  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
