/**
 * Database Seeding Script for Subscription System
 *
 * This script initializes the subscription plans collection with default plans.
 * Run this script after setting up the Firestore database.
 */

import { collection, doc, setDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { DEFAULT_SUBSCRIPTION_PLANS, SubscriptionPlanDocument } from './schema';

/**
 * Seeds the subscription plans collection with default plans.
 * Only adds plans that don't already exist.
 */
export async function seedSubscriptionPlans(): Promise<void> {
  console.log('🌱 Starting subscription plans seeding...');

  const plansRef = collection(db, 'subscriptionPlans');
  let createdCount = 0;
  let skippedCount = 0;

  for (const planData of DEFAULT_SUBSCRIPTION_PLANS) {
    try {
      // Check if plan already exists
      const existingQuery = query(
        plansRef,
        where('name', '==', planData.name),
        where('tier', '==', planData.tier)
      );
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        console.log(`⏭️  Plan "${planData.displayName}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create new plan document
      const planRef = doc(plansRef);
      const planDocument: SubscriptionPlanDocument = {
        ...planData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(planRef, planDocument);

      console.log(`✅ Created plan: ${planData.displayName} (${planData.tier})`);
      createdCount++;

    } catch (error) {
      console.error(`❌ Error creating plan "${planData.displayName}":`, error);
    }
  }

  console.log(`🎉 Seeding completed! Created: ${createdCount}, Skipped: ${skippedCount}`);
}

/**
 * Updates existing subscription plans with new features or pricing.
 * Use this for plan updates without creating duplicates.
 */
export async function updateSubscriptionPlans(): Promise<void> {
  console.log('🔄 Starting subscription plans update...');

  const plansRef = collection(db, 'subscriptionPlans');
  let updatedCount = 0;

  for (const planData of DEFAULT_SUBSCRIPTION_PLANS) {
    try {
      // Find existing plan
      const existingQuery = query(
        plansRef,
        where('name', '==', planData.name),
        where('tier', '==', planData.tier)
      );
      const existingDocs = await getDocs(existingQuery);

      if (existingDocs.empty) {
        console.log(`⚠️  Plan "${planData.displayName}" not found, skipping update...`);
        continue;
      }

      const planDoc = existingDocs.docs[0];
      const planRef = doc(plansRef, planDoc.id);

      // Update plan with new data (preserve Stripe IDs and other fields)
      const updateData = {
        ...planData,
        stripePriceId: planDoc.data().stripePriceId || planData.stripePriceId, // Preserve existing Stripe ID
        updatedAt: Timestamp.now(),
      };

      await setDoc(planRef, updateData, { merge: true });

      console.log(`✅ Updated plan: ${planData.displayName} (${planData.tier})`);
      updatedCount++;

    } catch (error) {
      console.error(`❌ Error updating plan "${planData.displayName}":`, error);
    }
  }

  console.log(`🎉 Update completed! Updated: ${updatedCount} plans`);
}

/**
 * Verifies that all required plans exist and are properly configured.
 */
export async function verifySubscriptionPlans(): Promise<boolean> {
  console.log('🔍 Verifying subscription plans...');

  const plansRef = collection(db, 'subscriptionPlans');
  const requiredTiers: Array<'free' | 'pro' | 'enterprise'> = ['free', 'pro', 'enterprise'];

  let allValid = true;

  for (const tier of requiredTiers) {
    try {
      const tierQuery = query(
        plansRef,
        where('tier', '==', tier),
        where('isActive', '==', true)
      );
      const tierDocs = await getDocs(tierQuery);

      if (tierDocs.empty) {
        console.error(`❌ Missing active plan for tier: ${tier}`);
        allValid = false;
        continue;
      }

      if (tierDocs.size > 1) {
        console.warn(`⚠️  Multiple active plans found for tier: ${tier} (${tierDocs.size} plans)`);
      }

      const plan = tierDocs.docs[0].data() as SubscriptionPlanDocument;
      console.log(`✅ Found plan: ${plan.displayName} (${tier}) - $${(plan.price / 100).toFixed(2)}/${plan.interval}`);

      // Validate required fields
      const requiredFields = ['name', 'displayName', 'limits', 'features'];
      for (const field of requiredFields) {
        if (!(field in plan)) {
          console.error(`❌ Plan "${plan.displayName}" missing required field: ${field}`);
          allValid = false;
        }
      }

    } catch (error) {
      console.error(`❌ Error verifying tier ${tier}:`, error);
      allValid = false;
    }
  }

  if (allValid) {
    console.log('🎉 All subscription plans verified successfully!');
  } else {
    console.error('❌ Some subscription plans have issues. Please check the errors above.');
  }

  return allValid;
}

/**
 * Main seeding function that can be called from a setup script.
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting database seeding process...');

    // Seed subscription plans
    await seedSubscriptionPlans();

    // Verify everything is set up correctly
    const isValid = await verifySubscriptionPlans();

    if (isValid) {
      console.log('🎉 Database seeding completed successfully!');
    } else {
      console.error('❌ Database seeding completed with errors. Please check the logs above.');
    }

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export for use in setup scripts or admin tools
export { DEFAULT_SUBSCRIPTION_PLANS };
