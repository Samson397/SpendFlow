/**
 * Setup Script for Subscription System
 *
 * Run this script to initialize the subscription system with default plans.
 * Execute with: npx tsx scripts/setup-subscriptions.ts
 */

import { seedDatabase } from '@/database/seed';

async function main() {
  console.log('🚀 Setting up SpendFlow subscription system...\n');

  try {
    await seedDatabase();
    console.log('\n✅ Subscription system setup completed successfully!');

    console.log('\n📋 Next steps:');
    console.log('1. Configure Stripe webhook endpoint: https://yourdomain.com/api/stripe/webhooks');
    console.log('2. Update STRIPE_WEBHOOK_SECRET in environment variables');
    console.log('3. Set up Stripe price IDs for your plans');
    console.log('4. Test the subscription flow');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
