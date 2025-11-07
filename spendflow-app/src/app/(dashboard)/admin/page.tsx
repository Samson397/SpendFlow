'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AnnouncementsBanner } from '@/components/announcements/AnnouncementsBanner';
import {
  collection,
  getCountFromServer,
  query,
  where,
  limit,
  getFirestore,
  doc,
  getDoc,
  QueryConstraint,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  UsersIcon as Users,
  CreditCardIcon as CreditCard,
  TagIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon as MessageSquare,
  ServerStackIcon as Database
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

type SystemHealthStatus = 'operational' | 'degraded' | 'maintenance';

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
  totalTransactionValue: number;
  totalBalance: number; // Total balance across all user cards
  totalMessages: number;
  newMessages: number;
  systemHealth: SystemHealthStatus;
  activeUsers: number;
  newUsers: number;
  storageUsed: string;
  loading: boolean;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
    totalTransactionValue: 0,
    totalBalance: 0,
    totalMessages: 0,
    newMessages: 0,
    systemHealth: 'operational',
    activeUsers: 0,
    newUsers: 0,
    storageUsed: '0 MB',
    loading: true
  });

  const checkSystemHealth = useCallback(async (): Promise<boolean> => {
    try {
      // Check database connection with timeout
      const firestore = getFirestore();
      const healthCheck = doc(firestore, 'system/health');

      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );

      await Promise.race([
        getDoc(healthCheck),
        timeoutPromise
      ]);

      return true;
    } catch (error) {
      console.warn('System health check failed (this is expected if system/health doesn\'t exist):', error);
      return false; // Don't throw, just return false
    }
  }, []);

  const loadStats = useCallback(async () => {
    // Safety timeout to force clear loading state if it gets stuck
    const safetyTimeout = setTimeout(() => {
      console.warn('🚨 Safety timeout: Forcing loading state clear');
      setStats(prev => ({ ...prev, loading: false }));
      setLoadingTimeout(true);
    }, 30000); // 30 second safety timeout

    try {
      console.log('📊 Loading admin statistics...');
      setStats(prev => ({ ...prev, loading: true }));

      // Set a timeout to show fallback UI if loading takes too long
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Stats loading is taking longer than expected...');
        setLoadingTimeout(true);
      }, 8000); // 8 second timeout

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Convert dates to Firestore Timestamps for queries
      const toFirestoreTimestamp = (date: Date) => {
        return Timestamp.fromDate(date);
      };

      // Helper function to safely get count from a collection
      const safeGetCount = async (
        collectionPath: string,
        isAdmin: boolean,
        ...queryConstraints: QueryConstraint[]
      ): Promise<number> => {
        try {
          if (!user) {
            console.error('❌ No authenticated user for count query');
            return 0;
          }

          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] 🔍 Fetching count for ${collectionPath}`, {
            queryConstraints,
            isAdmin,
            userId: user.uid
          });

          // Add admin check for sensitive collections
          const isSensitiveCollection = ['users', 'transactions', 'messages'].includes(collectionPath);
          if (isSensitiveCollection && !isAdmin) {
            console.warn('⚠️ Insufficient permissions for collection:', collectionPath);
            return 0;
          }

          // Use a different approach to count documents
          const queryPromise = (async () => {
            try {
              // Use a simple query with a limit to count documents
              const collectionRef = collection(db, collectionPath);
              let q = query(collectionRef, limit(1000)); // Limit to prevent large reads

              // Apply additional query constraints if provided
              if (queryConstraints.length > 0) {
                q = query(collectionRef, ...queryConstraints, limit(1000));
              }

              console.log(`[${timestamp}] Executing count query for ${collectionPath}:`, q);

              const querySnapshot = await getDocs(q);
              const docs = querySnapshot.docs;

              console.log(`[${timestamp}] ✅ Successfully counted ${docs.length} documents in ${collectionPath}`);
              return docs.length;

            } catch (error) {
              // Log the raw error first
              console.error(`[${timestamp}] ❌ Raw error for ${collectionPath}:`, error);

              // Then log the stringified version
              try {
                console.error(`[${timestamp}] ❌ Stringified error:`, JSON.stringify(error, null, 2));
              } catch (e) {
                console.error(`[${timestamp}] ❌ Could not stringify error:`, e);
              }

              // Fallback to a simple count with no filters
              try {
                console.log(`[${timestamp}] Trying simple count without filters...`);
                const collectionRef = collection(db, collectionPath);
                const q = query(collectionRef, limit(100));
                const snapshot = await getDocs(q);
                console.log(`[${timestamp}] Simple count result:`, snapshot.size);
                return snapshot.size;
              } catch (simpleError) {
                console.error(`[${timestamp}] ❌ Simple count failed:`, simpleError);
                return 0;
              }
            }
          })();

          const timeoutPromise = new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error(`Query timeout for ${collectionPath}`)), 15000)
          );

          try {
            return await Promise.race<number>([queryPromise, timeoutPromise]);
          } catch (raceError) {
            console.error(`[${new Date().toISOString()}] Error in Promise.race:`, raceError);
            return 0; // Return 0 if there's an error
          }
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error in safeGetCount for ${collectionPath}:`, error);
          // Return 0 for any error to prevent breaking the UI
          return 0;
        }
      };

      // Get all data in parallel with error handling for each query
      console.log('Fetching statistics with date range:', {
        now: now.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        sevenDaysAgo: sevenDaysAgo.toISOString()
      });

      const results = await Promise.allSettled([
        // 1. Total users - safe query
        safeGetCount('users', true),

        // 2. Active users (last 30 days) - safe query
        (async () => {
          try {
            const timestamp = toFirestoreTimestamp(thirtyDaysAgo);
            console.log('Fetching active users with lastActive >=', timestamp);
            return await safeGetCount(
              'users',
              true,
              where('lastActive', '>=', timestamp)
            );
          } catch (e) {
            console.error('Error in active users query:', e);
            return 0;
          }
        })(),

        // 3. New users (last 7 days) - safe query
        safeGetCount(
          'users',
          true,
          where('createdAt', '>=', toFirestoreTimestamp(sevenDaysAgo))
        ),

        // 4. Total transactions count and value - OPTIMIZED: avoid fetching all documents
        (async () => {
          try {
            const transactionsRef = collection(db, 'transactions');
            const transactionsQuery = query(transactionsRef);
            const transactionsSnapshot = await getCountFromServer(transactionsQuery);
            const transactionCount = transactionsSnapshot.data().count;

            // OPTIMIZATION: Instead of fetching ALL transactions, use a more efficient approach
            // For now, return count only and calculate value separately if needed
            // This prevents loading thousands of documents just for a sum
            return { count: transactionCount, value: 0 }; // Placeholder for value
          } catch (e) {
            console.error('Error calculating transaction stats:', e);
            return { count: 0, value: 0 };
          }
        })(),

        // 5. Total contact messages - safe query
        safeGetCount('contactMessages', true),

        // 6. New messages (last 7 days, unread or new) - safe query
        safeGetCount(
          'contactMessages',
          true,
          where('createdAt', '>=', toFirestoreTimestamp(sevenDaysAgo)),
          where('status', 'in', ['unread', 'new'])
        ),

        // 7. Total cards - safe query
        safeGetCount('cards', true),

        // 8. Calculate total balance across all cards
        (async () => {
          try {
            const cardsRef = collection(db, 'cards');
            const cardsSnapshot = await getDocs(cardsRef);
            let totalBalance = 0;
            
            cardsSnapshot.forEach((doc) => {
              const card = doc.data();
              // For credit cards: show available credit (limit - balance)
              // For debit cards: show balance
              if (card.type === 'credit') {
                totalBalance += (card.limit || 0) - (card.balance || 0);
              } else {
                totalBalance += card.balance || 0;
              }
            });
            
            console.log('Total balance calculated:', totalBalance);
            return totalBalance;
          } catch (e) {
            console.error('Error calculating total balance:', e);
            return 0;
          }
        })(),

        // 9. Calculate total transaction value
        (async () => {
          try {
            const transactionsRef = collection(db, 'transactions');
            const transactionsSnapshot = await getDocs(query(transactionsRef, limit(1000)));
            let totalValue = 0;
            
            transactionsSnapshot.forEach((doc) => {
              const transaction = doc.data();
              totalValue += Math.abs(transaction.amount || 0);
            });
            
            console.log('Total transaction value calculated:', totalValue);
            return totalValue;
          } catch (e) {
            console.error('Error calculating transaction value:', e);
            return 0;
          }
        })()
      ]);

      // Extract values from results with detailed error logging
      const extractResult = (index: number, name: string) => {
        const result = results[index];
        if (!result) {
          console.error(`No result at index ${index} for ${name}`);
          return 0;
        }
        if (result.status === 'fulfilled') {
          console.log(`${name} count:`, result.value);
          return result.value;
        } else {
          console.error(`Error fetching ${name}:`, result.reason);
          return 0;
        }
      };

      // Clear the timeout since we got results
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
      setLoadingTimeout(false);

      const totalUsers = extractResult(0, 'totalUsers') as number;
      const activeUsers = extractResult(1, 'activeUsers') as number;
      const newUsers = extractResult(2, 'newUsers') as number;
      const transactionStats = extractResult(3, 'transactionStats') as { count: number; value: number };
      const totalTransactions = transactionStats?.count || 0;
      const totalMessages = extractResult(4, 'totalMessages') as number;
      const newMessages = extractResult(5, 'newMessages') as number;
      const totalCards = extractResult(6, 'totalCards') as number;
      const totalBalance = extractResult(7, 'totalBalance') as number;
      const totalTransactionValue = extractResult(8, 'totalTransactionValue') as number;

      // Calculate storage usage (placeholder)
      const storageUsed = loadingTimeout ? 'Loading timeout - data unavailable' : 'Calculating...';

      // Get system health status
      const systemHealth = await checkSystemHealth();

      console.log('Stats loaded:', {
        totalUsers,
        totalCards,
        totalTransactions,
        totalMessages,
        newMessages,
        activeUsers,
        newUsers,
        storageUsed
      });

      setStats({
        totalUsers,
        totalCards,
        totalTransactions,
        totalTransactionValue,
        totalBalance,
        totalMessages,
        newMessages,
        systemHealth: loadingTimeout ? 'degraded' : (systemHealth ? 'operational' : 'degraded'),
        activeUsers,
        newUsers,
        storageUsed,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Clear timeouts
      clearTimeout(safetyTimeout);
      // Show a more user-friendly error message
      toast.error('Unable to load some statistics. This may be due to missing data or permissions.', {
        duration: 5000,
      });
      setStats(prev => ({
        ...prev,
        systemHealth: 'degraded',
        loading: false
      }));
    }
  }, [checkSystemHealth, user, isAdmin, loadingTimeout]);

  // Combined admin verification and data loading
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    // Hard fallback to prevent permanent loading state
    const hardFallbackTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('🚨 HARD FALLBACK: Forcing loading state to false after 45 seconds');
        setStats(prev => ({ ...prev, loading: false }));
        setLoadingTimeout(true);
        toast.error('Loading took too long. Some data may not be available.', { duration: 5000 });
      }
    }, 45000); // 45 second hard fallback

    const initializeAdminPage = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Quick admin check
        const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
        const isUserAdmin = user.email ? adminEmails.includes(user.email) : false;

        if (!isMounted) return;

        setIsAdmin(isUserAdmin);
        setCheckingAdmin(false);

        if (!isUserAdmin) {
          clearTimeout(hardFallbackTimeout);
          toast.error('Admin access required. Please contact support if you believe this is an error.', {
            duration: 5000,
          });
          setTimeout(() => {
            if (isMounted) {
              router.push('/dashboard');
            }
          }, 1000);
          return;
        }

        // Load stats immediately for admin users
        console.log('✅ Admin access granted, loading stats...');
        await loadStats();
        clearTimeout(hardFallbackTimeout); // Clear fallback if load succeeds

        // Set up refresh interval
        intervalId = setInterval(async () => {
          if (isMounted) {
            try {
              await loadStats();
            } catch (error) {
              console.error('Error refreshing stats:', error);
            }
          }
        }, 2 * 60 * 1000); // Refresh every 2 minutes

      } catch (error) {
        clearTimeout(hardFallbackTimeout);
        console.error('❌ Error initializing admin page:', error);
        if (isMounted) {
          setCheckingAdmin(false);
          toast.error('Error initializing admin page');
        }
      }
    };

    initializeAdminPage();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(hardFallbackTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authLoading, user, router, loadStats]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <div className="text-amber-400 text-lg font-serif tracking-wider">
            {authLoading ? 'Loading user...' : 'Verifying Admin Access...'}
          </div>
          <div className="mt-4 text-slate-400 text-sm">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => router.push('/dashboard')}
              >
                <span className="text-lg">💳</span>
                <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>My Transactions</span>
              </button>
              <button
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => router.push('/login')}
              >
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Contact Support</span>
              </button>
              <button
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => router.push('/dashboard')}
              >
                <SparklesIcon className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-300">Just now</td>
                    <td className="px-4 py-3 text-sm text-slate-300">Grocery Store</td>
                    <td className="px-4 py-3 text-sm text-red-400">-$45.67</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">Completed</span>
                    </td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Recent Activity</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Activity feed would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="fixed top-0 left-0 right-0 z-40">
        <AnnouncementsBanner />
      </div>

      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif mb-2 tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                System overview and management tools
              </p>
            </div>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Cards</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalCards}</p>
              </div>
              <span className="text-2xl">💳</span>
            </div>
          </div>
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Transactions</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalTransactions}</p>
              </div>
              <Database className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Messages</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalMessages}</p>
                {stats.newMessages > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>{stats.newMessages} new</p>
                )}
              </div>
              <MessageSquare className="h-8 w-8" style={{ color: 'var(--color-warning)' }} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Balance (All Users)</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  ${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Available funds</p>
              </div>
              <Database className="h-8 w-8" style={{ color: 'var(--color-info)' }} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Transaction Volume</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  ${stats.totalTransactionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Total processed</p>
              </div>
              <TagIcon className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
            </div>
          </div>
        </div>

        {/* Admin Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/overview"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition-colors">
                <ShieldCheckIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Admin Overview</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Real-time monitoring dashboard</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/messaging"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Message Center</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Respond to user inquiries</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>User Management</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Manage user accounts and permissions</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/recurring"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-900/30 rounded-lg group-hover:bg-amber-900/50 transition-colors">
                <span className="text-lg">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Recurring Payments</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Process automatic credit card payments</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/messages"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-lg group-hover:bg-green-900/50 transition-colors">
                <MessageSquare className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Messages</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>View and manage user contact messages</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/alerts"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition-colors">
                <SparklesIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>System Alerts</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Monitor and manage system alerts</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/announcements"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors">
                <SparklesIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Announcements</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Create and manage system announcements</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/cleanup"
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:bg-slate-800/30 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-600/50 transition-colors">
                <Database className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Data Cleanup</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Database maintenance and cleanup tools</p>
              </div>
            </div>
          </Link>
        </div>

        {/* System Health */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>System Health</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stats.systemHealth === 'operational'
                  ? 'bg-green-900/30 text-green-400'
                  : stats.systemHealth === 'degraded'
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-red-900/30 text-red-400'
              }`}>
                {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            System is {stats.systemHealth}. Last updated: Just now.
          </p>
        </div>
      </div>
    </div>
  );
}
