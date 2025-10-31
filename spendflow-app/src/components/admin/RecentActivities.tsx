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
        const recentActivities = await getRecentActivities(10);
        
        if (recentActivities.length === 0) {
          // If no activities found, add a welcome message
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
        console.error('Error loading activities:', error);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
    
    // Set up real-time updates
    const q = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot: { docs: QueryDocumentSnapshot<DocumentData, DocumentData>[] }) => {
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
        console.error('Error setting up real-time updates:', error);
        setError('Real-time updates unavailable. Some data may be outdated.');
      }
    );
    
    return () => unsubscribe();
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
          <span className="text-xs text-red-400">Connection error</span>
        </div>
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/50 text-sm text-red-200">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-100 px-3 py-1 rounded-md"
          >
            Retry
          </button>
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
