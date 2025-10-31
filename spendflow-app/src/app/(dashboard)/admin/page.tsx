'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  collection, 
  getCountFromServer, 
  query, 
  where,
  getFirestore, 
  doc, 
  getDoc,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  Server,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamically import the RecentActivities component
const RecentActivities = dynamic(
  () => import('@/components/admin/RecentActivities'),
  { ssr: false }
);

// Dynamically import the AdminTabs component to avoid SSR issues with Firebase
const AdminTabs = dynamic(() => import('@/components/admin/AdminTabs'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent"></div>
    </div>
  ),
});

// Dynamic imports for better performance
const StatusPage = dynamic(() => import('@/components/admin/StatusPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
    </div>
  ),
});

// Import ContactMessages component
const ContactMessages = dynamic(() => import('@/components/admin/ContactMessages'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
    </div>
  ),
});

type SystemHealthStatus = 'operational' | 'degraded' | 'maintenance';

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
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
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  // Helper function to check system health
  const checkSystemHealth = useCallback(async (): Promise<boolean> => {
    try {
      // Check database connection
      const firestore = getFirestore();
      await getDoc(doc(firestore, 'system/health'));
      return true;
    } catch (error) {
      console.error('System health check failed:', error);
      return false;
    }
  }, []);

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
    totalMessages: 0,
    newMessages: 0,
    systemHealth: 'operational',
    activeUsers: 0,
    newUsers: 0,
    storageUsed: '0 MB',
    loading: true
  });

  const loadStats = useCallback(async () => {
    try {
      console.log('Loading stats...');
      setStats(prev => ({ ...prev, loading: true }));
      
      // Get date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      // Convert dates to Firestore Timestamps for queries
      const toFirestoreTimestamp = (date: Date) => {
        return { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
      };
      
      // Helper function to safely get count from a collection
      const safeGetCount = async (
        collectionPath: string, 
        ...queryConstraints: QueryConstraint[]
      ): Promise<number> => {
        try {
          console.log(`Fetching count for ${collectionPath}...`);
          const collectionRef = collection(db, collectionPath);
          const q = queryConstraints.length > 0 
            ? query(collectionRef, ...queryConstraints) 
            : query(collectionRef);
          const snapshot = await getCountFromServer(q);
          const count = snapshot.data().count;
          console.log(`Count for ${collectionPath}:`, count);
          return count;
        } catch (error) {
          console.error(`Error getting count for ${collectionPath}:`, error);
          return 0; // Return 0 if collection doesn't exist or other error
        }
      };
      
      // Get all data in parallel with error handling for each query
      console.log('Fetching statistics with date range:', {
        now: now.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        sevenDaysAgo: sevenDaysAgo.toISOString()
      });

      const results = await Promise.allSettled([
        // 1. Total users
        safeGetCount('users').catch(e => {
          console.error('Error fetching total users:', e);
          throw e;
        }),
        
        // 2. Active users (last 30 days)
        (async () => {
          try {
            const timestamp = toFirestoreTimestamp(thirtyDaysAgo);
            console.log('Fetching active users with lastActive >=', timestamp, '(', thirtyDaysAgo.toISOString(), ')');
            const count = await safeGetCount(
              'users', 
              where('lastActive', '>=', timestamp)
            );
            console.log('Active users count:', count);
            return count;
          } catch (e) {
            console.error('Error in active users query:', e);
            throw e;
          }
        })(),
        
        // 3. New users (last 7 days)
        safeGetCount(
          'users', 
          where('createdAt', '>=', toFirestoreTimestamp(sevenDaysAgo))
        ).catch(e => {
          console.error('Error fetching new users:', e);
          throw e;
        }),
        
        // 4. Total transactions
        (async () => {
          try {
            console.log('Fetching total transactions...');
            const count = await safeGetCount('transactions');
            console.log('Total transactions count:', count);
            return count;
          } catch (e) {
            console.error('Error in transactions query:', e);
            // Try to get more details about the error
            if (e instanceof Error) {
              console.error('Error details:', {
                message: e.message,
                name: e.name,
                stack: e.stack
              });
            }
            throw e;
          }
        })(),
        
        // 5. Total contact messages
        safeGetCount('contactMessages').catch(e => {
          console.error('Error fetching total messages:', e);
          throw e;
        }),
        
        // 6. New messages (last 7 days, unread or new)
        safeGetCount(
          'contactMessages',
          where('createdAt', '>=', toFirestoreTimestamp(sevenDaysAgo)),
          where('status', 'in', ['unread', 'new'])
        ).catch(e => {
          console.error('Error fetching new messages:', e);
          throw e;
        }),
        
        // 7. Total cards
        safeGetCount('cards').catch(e => {
          console.error('Error fetching total cards:', e);
          throw e;
        })
      ]);
      
      // Extract values from results with detailed error logging
      const extractResult = (index: number, name: string) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          console.log(`${name} count:`, result.value);
          return result.value;
        } else {
          console.error(`Error fetching ${name}:`, result.reason);
          return 0;
        }
      };

      const totalUsers = extractResult(0, 'totalUsers');
      const activeUsers = extractResult(1, 'activeUsers');
      const newUsers = extractResult(2, 'newUsers');
      const totalTransactions = extractResult(3, 'totalTransactions');
      const totalMessages = extractResult(4, 'totalMessages');
      const newMessages = extractResult(5, 'newMessages');
      const totalCards = extractResult(6, 'totalCards');
      
      // Calculate storage usage (placeholder)
      const storageUsed = 'Calculating...';
      
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
        totalMessages,
        newMessages,
        systemHealth: systemHealth ? 'operational' : 'degraded',
        activeUsers,
        newUsers,
        storageUsed,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load dashboard data');
      setStats(prev => ({
        ...prev,
        systemHealth: 'degraded',
        loading: false
      }));
    }
  }, []);

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'status':
        return <StatusPage />;
      case 'users':
        return <div>Users Management</div>;
      case 'transactions':
        return <div>Transactions Management</div>;
      case 'messages':
        return (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-serif text-slate-100">Contact Messages</h2>
            </div>
            <ContactMessages />
          </div>
        );
      case 'settings':
        return <div>System Settings</div>;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick action buttons */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('status')}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Server className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <span className="text-sm">Status</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <span className="text-sm">Manage Users</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-amber-400" />
                    <span className="text-sm">View Transactions</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <span className="text-sm">View Messages</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Settings className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
              </div>
              
              {/* Recent Transactions Table */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-100 mb-4">Recent Transactions</h3>
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
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <RecentActivities />
              </div>
            </div>
          </div>
        );
    }
  };

  // Check admin status and load data when user or authLoading changes
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const verifyAdminAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        console.log('Verifying admin access for:', user.email);
        const isUserAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        console.log('Is user admin?', isUserAdmin);
        
        if (!isMounted) return;
        
        setIsAdmin(isUserAdmin);
        setCheckingAdmin(false);
        
        if (!isUserAdmin) {
          console.log('User is not an admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        // Only load stats if user is admin
        console.log('User is admin, loading stats...');
        
        const loadData = async () => {
          try {
            if (isMounted) {
              await loadStats();
            }
          } catch (error) {
            console.error('Error loading stats:', error);
            if (isMounted) {
              toast.error('Failed to load admin statistics');
            }
          }
        };
        
        // Initial load
        loadData();
        
        // Set up refresh interval (only if not already set)
        if (!intervalId) {
          intervalId = setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes
        }
        
      } catch (error) {
        console.error('Error verifying admin status:', error);
        if (isMounted) {
          setCheckingAdmin(false);
          toast.error('Error verifying admin access');
        }
      }
    };
    
    verifyAdminAccess();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, authLoading, router, loadStats]);

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
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('users')}
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <span className="text-sm">Manage Users</span>
              </button>
              <button 
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setActiveTab('transactions')}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-amber-400" />
                <span className="text-sm">View Transactions</span>
              </button>
              <button 
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <span className="text-sm">View Messages</span>
              </button>
              <button 
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
          
          {/* Recent Transactions Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Recent Transactions</h3>
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
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <RecentActivities />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-amber-400">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={loadStats}
              disabled={stats.loading}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-1 transition-colors ${
                stats.loading 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {stats.loading ? (
                <div className="animate-spin h-4 w-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 16h5v5"></path>
                  </svg>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 16h5v5"></path>
                </svg>
              )}
              <span>{stats.loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <AdminTabs stats={stats} onRefresh={loadStats} />
      </main>
    </div>
  );
}
