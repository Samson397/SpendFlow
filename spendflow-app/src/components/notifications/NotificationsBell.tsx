'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import * as Lucide from 'lucide-react';

// Real notification interface
interface NotificationData {
  id?: string;
  userId: string;
  type: 'payment_failed' | 'insufficient_funds_warning' | 'payment_success' | 'low_balance';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt?: Date;
}

interface NotificationsBellProps {
  className?: string;
}

export function NotificationsBell({ className = '' }: NotificationsBellProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real notifications from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as NotificationData[];

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id!), {
          read: true
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // The onSnapshot listener will automatically update the UI
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_failed':
        return <Lucide.AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'insufficient_funds_warning':
        return <Lucide.AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'payment_success':
        return <Lucide.CheckCircle className="h-4 w-4 text-green-400" />;
      case 'low_balance':
        return <Lucide.TrendingDown className="h-4 w-4 text-yellow-400" />;
      default:
        return <Lucide.Bell className="h-4 w-4 text-blue-400" />;
    }
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/50"
        title="Notifications"
      >
        <Lucide.Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-slate-100 font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <Lucide.Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                    !notification.read ? 'bg-slate-800/30' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id!)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-slate-100 truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="text-xs text-slate-500">
                        {notification.createdAt && formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close panel when clicking outside */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}
