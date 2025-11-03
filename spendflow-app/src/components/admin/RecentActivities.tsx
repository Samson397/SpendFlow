'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/types/activity';
import { getRecentActivities, ActivityLogger, logActivity } from '@/lib/activityService';
import { formatDistanceToNow } from 'date-fns';
import { User, AlertCircle, CreditCard, Shield, PlusCircle, Activity as ActivityIcon } from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, query, orderBy, limit, onSnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'security':
      return <Shield className="h-4 w-4 text-red-500" />;
    case 'transaction':
      return <CreditCard className="h-4 w-4 text-amber-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-400" />;
  }
};

const getActivityMessage = (activity: Activity) => {
  const { type, action, userEmail, metadata } = activity;
  
  switch (action) {
    case 'user_signed_up':
      return `New user signed up: ${userEmail || 'Unknown'}`;
    case 'user_logged_in':
      return `User logged in: ${userEmail || 'Unknown'}`;
    case 'transaction_created':
      return `New transaction: $${metadata?.amount?.toFixed(2) || '0.00'}`;
    case 'security_event':
      return `Security event: ${metadata?.event || 'Unknown event'}`;
    case 'welcome_message':
      return metadata?.message || 'Welcome to SpendFlow!';
    default:
      return metadata?.action || `Activity: ${action}`;
  }
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 [RecentActivities] Loading activities...');

        const recentActivities = await getRecentActivities(10);
        console.log('✅ [RecentActivities] Loaded activities:', recentActivities.length);

        if (recentActivities.length === 0) {
          // If no activities found, add a welcome message
          console.log('ℹ️ [RecentActivities] No activities found, showing welcome message');
          setActivities([{
            id: 'welcome-activity',
            type: 'system',
            action: 'welcome_message',
            timestamp: new Date(),
            metadata: {
              message: 'Welcome to your SpendFlow admin dashboard!',
              action: 'System initialized'
            }
          }]);
        } else {
          setActivities(recentActivities);
        }
      } catch (error) {
        console.error('❌ [RecentActivities] Error loading activities:', error);
        setError('Failed to load activities. The activities feature may not be enabled yet.');
        // Show welcome message even on error
        setActivities([{
          id: 'welcome-activity',
          type: 'system',
          action: 'welcome_message',
          timestamp: new Date(),
          metadata: {
            message: 'Recent Activity feature is being initialized...',
            action: 'System initializing'
          }
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();

    // Set up real-time updates (only if Firestore is working)
    try {
      const q = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q,
        (snapshot: { docs: QueryDocumentSnapshot<DocumentData, DocumentData>[] }) => {
          console.log('🔄 [RecentActivities] Real-time update received:', snapshot.docs.length, 'activities');
          const updatedActivities = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate()
            } as Activity;
          });
          setActivities(updatedActivities);
        },
        (error: Error) => {
          console.error('❌ [RecentActivities] Real-time updates error:', error);
          // Don't set error state for real-time failures, just log it
          console.warn('⚠️ [RecentActivities] Real-time updates unavailable, but component will still work');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn('⚠️ [RecentActivities] Could not set up real-time updates:', error);
      return () => {}; // No cleanup needed
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-400">Recent Activity</h3>
          <div className="h-4 w-8 bg-slate-800/50 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-800/50 animate-pulse">
              <div className="h-4 w-3/4 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-400">Recent Activity</h3>
          <span className="text-xs text-amber-400">Feature initializing</span>
        </div>
        <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/50 text-sm text-amber-200">
          <p>The Recent Activity feature is being set up. Activities will appear here once the system is fully configured.</p>
        </div>
      </div>
    );
  }

  const addTestActivity = async () => {
    await ActivityLogger.userSignedUp('test-user-123', 'test@example.com');
    await ActivityLogger.userLoggedIn('test-user-123', 'test@example.com');
    await ActivityLogger.transactionCreated('test-user-123', 'tx-123', 42.50);
    
    // Reload activities
    const recentActivities = await getRecentActivities(10);
    setActivities(recentActivities);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-400">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {activities.length > 0 ? `Showing ${activities.length} of many` : 'No recent activity'}
          </span>
          <button
            onClick={addTestActivity}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            title="Add test activity"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Test
          </button>
        </div>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/30">
          <div className="mx-auto h-10 w-10 text-slate-600 mb-2">
            <ActivityIcon className="mx-auto h-8 w-8" />
          </div>
          <h4 className="text-sm font-medium text-slate-300">No recent activity</h4>
          <p className="text-xs text-slate-500 mt-1">
            User actions and system events will appear here
          </p>
          <button
            onClick={addTestActivity}
            className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 mx-auto"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add test activity
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
            <div className="mt-0.5">
              <div className="p-1.5 rounded-full bg-slate-700/50">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-slate-500">
                {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
              </p>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
