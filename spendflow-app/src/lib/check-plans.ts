/**
 * Quick script to check and seed subscription plans
 * Run this in the browser console when logged in as admin
 */

import { seedSubscriptionPlans, verifySubscriptionPlans } from '@/database/seed';
import { subscriptionService } from '@/lib/services/subscriptionService';

async function checkAndSeedPlans() {
  console.log('🔍 Checking subscription plans...');

  try {
    // First verify if plans exist
    const plansExist = await verifySubscriptionPlans();

    if (!plansExist) {
      console.log('📝 Plans missing or invalid, seeding...');
      await seedSubscriptionPlans();

      // Verify again after seeding
      await verifySubscriptionPlans();
    } else {
      console.log('✅ Plans are already set up correctly');
    }

    // Test getting plans
    const plans = await subscriptionService.getPlans();
    console.log('📋 Available plans:', plans.map(p => `${p.displayName} (${p.tier}) - $${(p.price / 100).toFixed(2)}`));

  } catch (error) {
    console.error('❌ Error checking/seeding plans:', error);
  }
}

// Make it available globally for easy access
(window as any).checkAndSeedPlans = checkAndSeedPlans;

console.log('💡 Run checkAndSeedPlans() to check and seed subscription plans');
