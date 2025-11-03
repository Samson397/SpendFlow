'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Bell, 
  Settings, 
  MessageSquare, 
  Activity as ActivityIcon, 
  Database, 
  AlertCircle, 
  Mail, 
  CreditCard, 
  AlertTriangle,
  Crown 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Activity } from '@/types/activity';
import { getRecentActivities, ActivityLogger } from '@/lib/activityService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { alertsService } from '@/lib/alerts';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { subscriptionService } from '@/lib/services/subscriptionService';
import toast from 'react-hot-toast';
import { DataCleanupService, CleanupResult } from '@/lib/services/dataCleanupService';
import { SubscriptionPlan } from '@/types/subscription';

// Dynamically import components for better performance
const UserManagement = dynamic(() => import('./UserManagement'), { ssr: false });
const MessagesPanel = dynamic(() => import('./MessagesPanel'), { ssr: false });
const AnnouncementsPanel = dynamic(() => import('./AnnouncementsPanel'), { ssr: false });
const AlertsPanel = dynamic(() => import('./AlertsPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });
const OnlineUsers = dynamic(() => import('./OnlineUsers').then(mod => ({ default: mod.OnlineUsers })), { ssr: false });

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
  totalTransactionValue: number;
  totalMessages: number;
  newMessages: number;
  systemHealth: 'operational' | 'degraded' | 'maintenance';
  activeUsers: number;
  storageUsed: string;
  loading?: boolean;
}

interface AdminTabsProps {
  stats: AdminStats;
  onRefresh: () => Promise<void>;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <Crown className="h-4 w-4" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'announcements', label: 'Announcements', icon: <Bell className="h-4 w-4" /> },
  { id: 'cleanup', label: 'Data Cleanup', icon: <Database className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export default function AdminTabs({ stats, onRefresh }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  // Initialize activeTab from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without triggering a page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url.toString());
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout process...');

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out from Firebase
      await signOut(auth);

      console.log('✅ Successfully signed out from Firebase');

      // Force redirect to login page
      window.location.href = '/login';

    } catch (error: unknown) {
      console.error('❌ Logout error:', error);

      // Handle specific Firebase errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/insufficient-permission') {
        console.warn('⚠️ Insufficient permission during logout - this may be expected');
        // Still try to redirect even if logout partially failed
        window.location.href = '/login';
        return;
      }

      // For other errors, try alternative logout methods
      try {
        console.log('🔄 Trying alternative logout method...');

        // Clear auth state manually
        if (typeof window !== 'undefined') {
          // Clear any cached auth data
          window.localStorage.removeItem('firebase:authUser');
          window.localStorage.removeItem('firebaseLocalStorageDb');
          window.sessionStorage.clear();
        }

        // Force redirect
        window.location.href = '/login';

      } catch (fallbackError) {
        console.error('❌ Fallback logout also failed:', fallbackError);
        toast.error('Logout failed. Please refresh the page and try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--theme-accent)">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Manage your application&apos;s users, security, and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden md:inline">{user?.email}</span>
          <span className="text-xs px-2 py-1 rounded bg-amber-900/30 text-amber-400">
            Admin
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Logout
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 flex items-center gap-2 transition-colors"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'messages' && stats.newMessages > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs text-white">
                    {stats.newMessages > 9 ? '9+' : stats.newMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-4">
        {activeTab === 'dashboard' && <DashboardPanel stats={stats} setActiveTab={handleTabChange} onRefresh={onRefresh} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'subscriptions' && <SubscriptionPanel />}
        {activeTab === 'messages' && <MessagesPanel />}
        {activeTab === 'alerts' && <AlertsPanel />}
        {activeTab === 'announcements' && <AnnouncementsPanel />}
        {activeTab === 'cleanup' && <DataCleanupPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendPositive, loading }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  trend: string;
  trendPositive: boolean;
  loading?: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-slate-800/50">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendPositive 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-slate-800/50 text-slate-400'
        }`}>
          {loading ? 'Loading...' : trend}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-100">
        {loading ? (
          <div className="animate-pulse bg-slate-700 rounded h-8 w-16"></div>
        ) : (
          value
        )}
      </h3>
      <p className="mt-1 text-sm text-slate-400">{title}</p>
    </div>
  );
}

// Dashboard Panel Component
function DashboardPanel({ stats, setActiveTab, onRefresh }: { 
  stats: AdminStats; 
  setActiveTab: (tab: string) => void;
  onRefresh?: () => void;
}) {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { formatAmount } = useCurrency();
  const [alertStats, setAlertStats] = useState({
    critical: 0,
    active: 0,
    resolved: 0,
    total: 0
  });
  const { user } = useAuth();

  // Check if user is admin
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await getRecentActivities(5);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    const loadAlertStats = async () => {
      try {
        // For non-admin users, only fetch their own alerts
        const alerts = await alertsService.getAll({
          userId: isAdmin ? undefined : user?.uid
        });
        
        const stats = {
          critical: alerts.filter(a => a.type === 'critical' && a.status === 'active').length,
          active: alerts.filter(a => a.status === 'active').length,
          resolved: alerts.filter(a => a.status === 'resolved').length,
          total: alerts.length
        };
        
        setAlertStats(stats);
      } catch (error) {
        console.error('Error loading alert stats:', error);
        // Set default empty stats on error
        setAlertStats({
          critical: 0,
          active: 0,
          resolved: 0,
          total: 0
        });
      }
    };

    loadActivities();
    loadAlertStats();
  }, [isAdmin, user?.uid]);

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-400" />;
      case 'transaction':
        return <CreditCard className="h-4 w-4 text-green-400" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-400" />;
      case 'system':
        return <Settings className="h-4 w-4 text-purple-400" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    // Use metadata.action if available, otherwise format the action
    if (activity.metadata?.action) {
      return activity.metadata.action;
    }
    
    // Format common actions
    switch (activity.action) {
      case 'user_signed_up':
        return 'New user registered';
      case 'user_logged_in':
        return 'User logged in';
      case 'transaction_created':
        return `New transaction: $${activity.metadata?.amount || 'N/A'}`;
      default:
        return activity.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  const handleActivityMenuAction = async (action: string, activity: Activity) => {
    try {
      switch (action) {
        case 'view_details':
          setSelectedActivity(activity);
          break;
        case 'delete':
          // Note: Deleting activities might not be implemented in the backend
          // This is just a placeholder for future functionality
          if (confirm(`Are you sure you want to delete this activity?\n\n"${activity.action}" by ${activity.userEmail}`)) {
            // Remove from local state (would need backend call in real implementation)
            setRecentActivities(prev => prev.filter(a => a.id !== activity.id));
            toast.success('Activity removed from view');
          }
          break;
        case 'copy_details':
          const details = `Activity Details:\nType: ${activity.type}\nAction: ${activity.action}\nUser: ${activity.userEmail || 'System'}\nTime: ${new Date(activity.timestamp).toLocaleString()}\nMetadata: ${JSON.stringify(activity.metadata, null, 2)}`;
          navigator.clipboard.writeText(details).then(() => {
            toast.success('Activity details copied to clipboard');
          }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = details;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Activity details copied to clipboard');
          });
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling activity menu action:', error);
      toast.error('Failed to perform action');
    }
    setOpenMenuId(null); // Close menu after action
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const generateTestActivities = async () => {
    try {
      // Generate some test activities
      await ActivityLogger.userSignedUp('test-user-1', 'john@example.com');
      await ActivityLogger.userLoggedIn('test-user-1', 'john@example.com');
      await ActivityLogger.transactionCreated('test-user-1', 'txn-123', 99.99);
      await ActivityLogger.securityEvent('login_attempt', { success: false, ip: '192.168.1.1' });
      
      // Reload activities to show the new ones
      const activities = await getRecentActivities(5);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error generating test activities:', error);
    }
  };

  const toggleMenu = (activityId: string | undefined) => {
    if (activityId) {
      setOpenMenuId(openMenuId === activityId ? null : activityId);
    }
  };
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          trend={`${stats.activeUsers} active users`}
          trendPositive={true}
          loading={stats.loading}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={<ActivityIcon className="h-5 w-5 text-green-500" />} 
          trend={`${Math.round((stats.activeUsers / Math.max(1, stats.totalUsers)) * 100)}% of total`}
          trendPositive={true}
          loading={stats.loading}
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions} 
          icon={<CreditCard className="h-5 w-5 text-amber-500" />} 
          trend={`${formatAmount(stats.totalTransactionValue)} total`}
          trendPositive={stats.totalTransactions > 0}
          loading={stats.loading}
        />
        <StatCard 
          title="Messages" 
          value={stats.totalMessages} 
          icon={<Mail className="h-5 w-5 text-purple-500" />} 
          trend={`${stats.newMessages} new`}
          trendPositive={stats.newMessages > 0}
          loading={stats.loading}
        />
      </div>

      {/* System Health */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">System Health</h3>
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
            <span className="text-sm text-slate-400">Last updated: Just now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Database</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">MongoDB</p>
                  <p className="text-sm text-slate-500">Connected</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>Storage</span>
                  <span>{stats.storageUsed} / 10GB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(parseInt(stats.storageUsed) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">API</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">API Status</p>
                  <p className="text-sm text-slate-500">All systems operational</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Response Time</span>
                  <span className="text-green-400 font-mono">142ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-slate-300">99.99%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Alerts</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg h-full">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-900/30 rounded-lg mt-0.5">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium">
                    {alertStats.critical > 0 
                      ? `${alertStats.critical} critical issue${alertStats.critical > 1 ? 's' : ''}` 
                      : alertStats.active > 0 
                      ? `${alertStats.active} active alert${alertStats.active > 1 ? 's' : ''}` 
                      : 'No critical issues'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {alertStats.total > 0 
                      ? `${alertStats.total} total alert${alertStats.total > 1 ? 's' : ''} • ${alertStats.resolved} resolved`
                      : stats.systemHealth === 'operational' 
                      ? 'All systems are running smoothly.' 
                      : stats.systemHealth === 'degraded'
                      ? 'Some non-critical issues detected.'
                      : 'Critical issues require attention.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                {isAdmin && (
                  <button 
                    onClick={() => setActiveTab('alerts')}
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    View all alerts
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Users */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <OnlineUsers />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">Recent Activity</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh || (() => {})}
              disabled={stats.loading}
              className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              title="Refresh admin statistics immediately"
            >
              {stats.loading ? '🔄 Refreshing...' : '🔄 Refresh Stats'}
            </button>
            {stats.loading && (
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-red-400 hover:text-red-300 underline"
                title="Force reload the entire page if stats are stuck loading"
              >
                🔄 Force Reload Page
              </button>
            )}
            {isAdmin && (
              <button
                onClick={generateTestActivities}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
                title="Generate sample activities for testing (Admin only)"
              >
                Generate Test Data
              </button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {loadingActivities ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 mt-0.5">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-slate-100">
                      {activity.userEmail || 'System'}
                    </span>{' '}
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(activity.id);
                    }}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/50 transition-colors"
                    title="Activity options"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openMenuId === activity.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityMenuAction('view_details', activity);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          📋 View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityMenuAction('filter_similar', activity);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          🔍 Filter Similar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityMenuAction('copy_details', activity);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          📋 Copy Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityMenuAction('delete', activity);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300"
                        >
                          🗑️ Remove from View
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No recent activity</p>
              <p className="text-xs text-slate-500 mt-1">Activity will appear here as users interact with the system</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-100">Activity Details</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-400">Type</label>
                    <p className="text-slate-100 mt-1">{selectedActivity.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-400">Action</label>
                    <p className="text-slate-100 mt-1">{selectedActivity.action}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-400">User</label>
                  <p className="text-slate-100 mt-1">{selectedActivity.userEmail || 'System'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-400">Timestamp</label>
                  <p className="text-slate-100 mt-1">{new Date(selectedActivity.timestamp).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-400">Metadata</label>
                  <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded p-3">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subscription Panel Component
function SubscriptionPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingPlans, setSeedingPlans] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await subscriptionService.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const seedPlans = async () => {
    try {
      setSeedingPlans(true);
      const { seedSubscriptionPlans } = await import('@/database/seed');
      await seedSubscriptionPlans();
      await loadPlans(); // Reload plans after seeding
      toast.success('Subscription plans seeded successfully!');
    } catch (error) {
      console.error('Error seeding plans:', error);
      toast.error('Failed to seed subscription plans');
    } finally {
      setSeedingPlans(false);
    }
  };

  const verifyPlans = async () => {
    try {
      const { verifySubscriptionPlans } = await import('@/database/seed');
      const isValid = await verifySubscriptionPlans();
      if (isValid) {
        toast.success('All subscription plans are valid!');
      } else {
        toast.error('Some plans have issues - check console for details');
      }
    } catch (error) {
      console.error('Error verifying plans:', error);
      toast.error('Failed to verify subscription plans');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-slate-100">Subscription Management</h2>
          <p className="text-slate-400 text-sm">Manage subscription plans and billing</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedPlans}
            disabled={seedingPlans}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {seedingPlans ? 'Seeding...' : 'Seed Plans'}
          </button>
          <button
            onClick={verifyPlans}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Verify Plans
          </button>
          <button
            onClick={loadPlans}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <div key={plan.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">{plan.displayName}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  plan.tier === 'free' ? 'bg-gray-900/30 text-gray-400' :
                  plan.tier === 'pro' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-amber-900/30 text-amber-400'
                }`}>
                  {plan.tier.toUpperCase()}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-slate-100">
                  ${plan.price === 0 ? 'Free' : (plan.price / 100).toFixed(2)}
                  {plan.price > 0 && <span className="text-sm text-slate-400">/{plan.interval}</span>}
                </div>
                <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Max Cards:</span>
                  <span className="text-slate-200">
                    {plan.limits.maxCards === -1 ? 'Unlimited' : plan.limits.maxCards}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Max Transactions:</span>
                  <span className="text-slate-200">
                    {plan.limits.maxTransactions === -1 ? 'Unlimited' : plan.limits.maxTransactions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Analytics:</span>
                  <span className={`text-sm ${plan.limits.analytics ? 'text-green-400' : 'text-red-400'}`}>
                    {plan.limits.analytics ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Export:</span>
                  <span className={`text-sm ${plan.limits.export ? 'text-green-400' : 'text-red-400'}`}>
                    {plan.limits.export ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded ${
                    plan.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Crown className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Subscription Plans Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              Subscription plans need to be seeded into the database before they can be used.
            </p>
            <button
              onClick={seedPlans}
              disabled={seedingPlans}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {seedingPlans ? 'Seeding Plans...' : 'Seed Subscription Plans'}
            </button>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      {plans.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-slate-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.open('/admin', '_blank')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
            >
              <Users className="h-5 w-5 text-blue-400 mb-2" />
              <div className="text-sm font-medium text-slate-200">Manage Users</div>
              <div className="text-xs text-slate-400">Assign subscriptions to users</div>
            </button>
            <button
              onClick={verifyPlans}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
            >
              <Shield className="h-5 w-5 text-green-400 mb-2" />
              <div className="text-sm font-medium text-slate-200">Verify Setup</div>
              <div className="text-xs text-slate-400">Check plan configuration</div>
            </button>
            <button
              onClick={() => window.open('/subscription', '_blank')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
            >
              <Crown className="h-5 w-5 text-amber-400 mb-2" />
              <div className="text-sm font-medium text-slate-200">View Plans</div>
              <div className="text-xs text-slate-400">See available subscriptions</div>
            </button>
            <button
              onClick={() => toast.success('Feature coming soon!')}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left opacity-50 cursor-not-allowed"
            >
              <BarChart3 className="h-5 w-5 text-purple-400 mb-2" />
              <div className="text-sm font-medium text-slate-200">Analytics</div>
              <div className="text-xs text-slate-400">Subscription metrics</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Data Cleanup Panel Component
function DataCleanupPanel() {
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [collectionsSummary, setCollectionsSummary] = useState<any[] | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleGetSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await DataCleanupService.getCollectionsSummary();
      setCollectionsSummary(summary);
    } catch (error) {
      console.error('Error getting collections summary:', error);
      toast.error('Failed to get collections summary');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleDryRun = async () => {
    try {
      const result = await DataCleanupService.dryRunCleanup();
      console.log('Dry run result:', result);
      toast.success(`Dry run complete. Would delete ${result.estimatedDocuments} documents from ${result.collectionsToClean.length} collections.`);
    } catch (error) {
      console.error('Error running dry run:', error);
      toast.error('Failed to run cleanup dry run');
    }
  };

  const handleCleanup = async () => {
    if (confirmationText !== "YES_I_WANT_TO_DELETE_EVERYTHING") {
      toast.error('Please enter the exact confirmation phrase');
      return;
    }

    setIsCleaning(true);
    try {
      const result = await DataCleanupService.wipeAllUserData(confirmationText);
      setCleanupResult(result);

      if (result.success) {
        toast.success(`Successfully deleted ${result.totalDocumentsDeleted} documents`);
        setConfirmationText('');
      } else {
        toast.error(`Cleanup completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error('Cleanup failed');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-amber-400" />
        <div>
          <h2 className="text-2xl font-serif text-slate-100">Data Cleanup</h2>
          <p className="text-slate-400 text-sm">Reset Firebase database to clean state</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ DANGER ZONE</h3>
            <p className="text-red-300 text-sm mb-3">
              This action will permanently delete ALL user data from Firebase. This includes:
            </p>
            <ul className="text-red-300 text-sm space-y-1 mb-3">
              <li>• User accounts and profiles</li>
              <li>• All transactions and financial data</li>
              <li>• Payment cards and billing information</li>
              <li>• Messages and communication history</li>
              <li>• Activity logs and audit trails</li>
              <li>• Subscription records and payments</li>
            </ul>
            <p className="text-red-300 text-sm font-semibold">
              This action CANNOT be undone. Make sure you have backups if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Collections Summary */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">Database Summary</h3>
          <button
            onClick={handleGetSummary}
            disabled={isLoadingSummary}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 rounded-lg text-sm transition-colors"
          >
            {isLoadingSummary ? 'Loading...' : 'Get Summary'}
          </button>
        </div>

        {collectionsSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-slate-200 font-medium mb-3">User Data Collections</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {collectionsSummary
                  .filter(c => c.type === 'user_data')
                  .map(collection => (
                    <div key={collection.collection} className="flex justify-between text-sm">
                      <span className="text-slate-300">{collection.collection}</span>
                      <span className="text-slate-400">{collection.documentCount}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-slate-200 font-medium mb-3">System Collections</h4>
              <div className="space-y-2">
                {collectionsSummary
                  .filter(c => c.type === 'system_data')
                  .map(collection => (
                    <div key={collection.collection} className="flex justify-between text-sm">
                      <span className="text-slate-300">{collection.collection}</span>
                      <span className="text-slate-400">{collection.documentCount}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dry Run */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-100 mb-4">Test Run</h3>
        <p className="text-slate-400 text-sm mb-4">
          Test what would be deleted without actually deleting anything.
        </p>
        <button
          onClick={handleDryRun}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          Run Dry Test
        </button>
      </div>

      {/* Actual Cleanup */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-100 mb-4">Complete Data Wipe</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Confirmation Phrase
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type: YES_I_WANT_TO_DELETE_EVERYTHING"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded focus:border-red-500 focus:outline-none transition-colors"
            />
            <p className="text-slate-500 text-xs mt-1">
              Type the exact phrase to enable the delete button
            </p>
          </div>

          <button
            onClick={handleCleanup}
            disabled={isCleaning || confirmationText !== "YES_I_WANT_TO_DELETE_EVERYTHING"}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isCleaning ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting All Data...
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5" />
                Delete All User Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {cleanupResult && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-slate-100 mb-4">Cleanup Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-100">{cleanupResult.collectionsProcessed}</div>
              <div className="text-sm text-slate-400">Collections Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{cleanupResult.totalDocumentsDeleted}</div>
              <div className="text-sm text-slate-400">Documents Deleted</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${cleanupResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {cleanupResult.success ? 'Success' : 'Errors'}
              </div>
              <div className="text-sm text-slate-400">Status</div>
            </div>
          </div>

          {cleanupResult.errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-700/50 rounded p-4 mb-4">
              <h4 className="text-red-400 font-medium mb-2">Errors:</h4>
              <ul className="text-red-300 text-sm space-y-1">
                {cleanupResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-slate-300 font-medium">Collection Details:</h4>
            {cleanupResult.collectionResults.map((result) => (
              <div key={result.collection} className="flex justify-between text-sm bg-slate-800/50 p-2 rounded">
                <span className="text-slate-300">{result.collection}</span>
                <span className={`font-medium ${result.error ? 'text-red-400' : 'text-green-400'}`}>
                  {result.error ? 'Error' : `${result.documentsDeleted} deleted`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
