'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { DEFAULT_SUBSCRIPTION_PLANS } from '@/database/schema';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  // Check if setup mode is enabled
  useEffect(() => {
    const isSetupMode = process.env.NEXT_PUBLIC_SETUP_MODE === 'true';
    if (!isSetupMode) {
      router.push('/');
      return;
    }
    checkExistingPlans();
  }, [router]);

  const checkExistingPlans = async () => {
    try {
      const plansRef = collection(db, 'subscriptionPlans');
      const q = query(plansRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      const existingPlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPlans(existingPlans);
    } catch (error) {
      console.error('Error checking plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      const plansRef = collection(db, 'subscriptionPlans');

      for (const planData of DEFAULT_SUBSCRIPTION_PLANS) {
        // Check if plan already exists
        const existingQuery = query(
          plansRef,
          where('name', '==', planData.name),
          where('tier', '==', planData.tier)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
          console.log(`Plan "${planData.displayName}" already exists, skipping...`);
          continue;
        }

        // Create new plan
        const docRef = await addDoc(plansRef, {
          ...planData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`Created plan: ${planData.displayName} (${docRef.id})`);
      }

      // Refresh plans list
      await checkExistingPlans();
      alert('✅ Database seeded successfully! You can now use the subscription system.');

    } catch (error) {
      console.error('Error seeding database:', error);
      alert('❌ Error seeding database: ' + (error as Error).message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">Loading Setup...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SpendFlow Setup</h1>
            <div className="flex gap-3">
              <a
                href="/subscription"
                className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Subscription →
              </a>
              <a
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
              >
                Dashboard →
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Database Setup
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Set up your subscription system by seeding the database with default plans.
              This is required before you can use the subscription features.
            </p>
          </div>

          {/* Current Plans Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Database Status
            </h2>

            {plans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Plans Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your database needs to be seeded with subscription plans before you can use the subscription system.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          plan.tier === 'free' ? 'bg-gray-400' :
                          plan.tier === 'pro' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{plan.displayName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{plan.tier} plan</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)}/${plan.interval}`}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Setup Action */}
          {plans.length === 0 && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Set Up</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  This will create 3 subscription plans: Essential (Free), Professional ($4.99/month), and Enterprise ($9.99/month).
                  These plans are required for the subscription system to work properly.
                </p>

                <Button
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSeeding ? (
                    <>
                      <svg className="w-5 h-5 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting Up Database...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Set Up Subscription Plans
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {plans.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">🎉 Setup Complete!</h3>
                <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                  Your database has been successfully seeded with subscription plans.
                  You can now use all the subscription features in your SpendFlow app.
                </p>

                <div className="flex gap-4 justify-center">
                  <Button asChild className="bg-white text-green-600 hover:bg-gray-100">
                    <a href="/subscription" className="inline-flex items-center gap-2 px-6 py-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      View Subscription Plans
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
                      </svg>
                      Go to Dashboard
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
