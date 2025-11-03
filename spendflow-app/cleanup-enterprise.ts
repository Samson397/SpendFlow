#!/usr/bin/env node

/**
 * Cleanup script to remove invalid enterprise subscriptions
 * This ensures no user has enterprise access without legitimate payment
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// Firebase config - load from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupInvalidEnterpriseSubscriptions() {
  console.log('🧹 Cleaning up invalid enterprise subscriptions...\n');

  try {
    // Find all subscriptions with enterprise plan
    const enterprisePlanQuery = query(
      collection(db, 'subscriptionPlans'),
      where('tier', '==', 'enterprise'),
      where('isActive', '==', true)
    );

    const enterprisePlans = await getDocs(enterprisePlanQuery);

    if (enterprisePlans.empty) {
      console.log('✅ No enterprise plans found - nothing to clean up');
      return;
    }

    for (const planDoc of enterprisePlans.docs) {
      const planId = planDoc.id;
      console.log(`🔍 Checking subscriptions for enterprise plan: ${planDoc.data().displayName}`);

      // Find all user subscriptions with this enterprise plan
      const userSubscriptionsQuery = query(
        collection(db, 'userSubscriptions'),
        where('planId', '==', planId)
      );

      const userSubscriptions = await getDocs(userSubscriptionsQuery);

      for (const subDoc of userSubscriptions.docs) {
        const subscriptionData = subDoc.data();

        // Check if this is a legitimate enterprise subscription
        const hasValidEnterpriseAccess = subscriptionData.status === 'active' &&
                                       subscriptionData.stripeSubscriptionId &&
                                       !subscriptionData.cancelAtPeriodEnd;

        if (!hasValidEnterpriseAccess) {
          console.log(`❌ Invalid enterprise subscription found for user: ${subscriptionData.userId}`);
          console.log(`   Status: ${subscriptionData.status}`);
          console.log(`   Stripe ID: ${subscriptionData.stripeSubscriptionId || 'None'}`);
          console.log(`   Cancel at period end: ${subscriptionData.cancelAtPeriodEnd}`);

          // Remove the invalid subscription
          await deleteDoc(doc(db, 'userSubscriptions', subDoc.id));
          console.log(`   ✅ Removed invalid enterprise subscription\n`);
        } else {
          console.log(`✅ Valid enterprise subscription for user: ${subscriptionData.userId}\n`);
        }
      }
    }

    console.log('🎉 Cleanup complete! All invalid enterprise subscriptions have been removed.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupInvalidEnterpriseSubscriptions().catch(console.error);
