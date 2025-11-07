'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { AuthGate } from '@/components/auth/AuthGate';
import { DataExport } from '@/components/export/DataExport';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { PushNotificationService } from '@/lib/services/pushNotificationService';
import { GeolocationService } from '@/lib/services/geolocationService';
import { UserAdminMessaging } from '@/components/messaging/UserAdminMessaging';
import { DeviceManagement } from '@/components/profile/DeviceManagement';
import { UpcomingPayments } from '@/components/payments/UpcomingPayments';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

function ProfilePageContent() {
  const { user } = useAuth();
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [analyticsKey, setAnalyticsKey] = useState(0); // Force analytics re-render
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Initialize push notifications and check current status
  useEffect(() => {
    const initNotifications = async () => {
      const initialized = await PushNotificationService.initialize();
      if (initialized && user?.uid) {
        // Check if user is already subscribed
        try {
          // This is a simplified check - in a real app you'd check the user document
          const permission = await PushNotificationService.requestPermission();
          setPushNotificationsEnabled(permission === 'granted');
        } catch (error) {
          console.error('Error checking notification status:', error);
        }
      }
    };

    initNotifications();
  }, [user]);

  // Handle push notification toggle
  const handleToggleNotifications = async () => {
    if (!user?.uid) return;

    try {
      if (pushNotificationsEnabled) {
        await PushNotificationService.unsubscribeUser(user.uid);
        setPushNotificationsEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        const success = await PushNotificationService.subscribeUser(user.uid);
        if (success) {
          setPushNotificationsEnabled(true);
          toast.success('Push notifications enabled! You\'ll now receive notifications on this device.');
        } else {
          toast.error('Failed to enable push notifications. Please check your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
    }
  };

  // Show notification when modal opens
  useEffect(() => {
    if (showMessagingModal) {
      toast.success('💬 Support & Messages opened! Send us your questions or feedback.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #f59e0b',
        },
        icon: '📨',
      });
    }
  }, [showMessagingModal]);

  // Refresh analytics when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setAnalyticsKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle name editing
  const handleEditName = () => {
    setEditingName(user?.displayName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user || !editingName.trim()) return;

    setSavingName(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: editingName.trim(),
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: editingName.trim(),
        updatedAt: new Date().toISOString(),
      });

      setIsEditingName(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name. Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditingName('');
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Header */}
      <div className="text-center px-2 sm:px-4">
        <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide">
          P R O F I L E
        </h1>
        <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Account Information</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-slate-800 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center border-2 border-amber-600">
              {/* @ts-expect-error Conflicting React types between lucide-react and project */}
              <User className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-amber-400" />
            </div>
            
            {isEditingName ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="text-xl sm:text-2xl md:text-3xl font-serif text-slate-100 bg-slate-800/50 border border-amber-600 rounded px-3 py-1 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your name"
                    disabled={savingName}
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !editingName.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                    <Check className="h-4 w-4" />
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingName}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-slate-100">{user?.displayName || 'User'}</h2>
                <button
                  onClick={handleEditName}
                  className="p-1 text-amber-400 hover:text-amber-300 transition-colors"
                  title="Edit name"
                >
                  {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className="text-slate-500 text-sm sm:text-base tracking-wider">{user?.email}</div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Email</div>
                </div>
                <div className="text-base sm:text-lg font-serif text-slate-100">{user?.email}</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Account Status</div>
                </div>
                <div className="text-base sm:text-lg font-serif text-slate-100">Unlimited Access</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Member Since</div>
                </div>
                <div className="text-base sm:text-lg font-serif text-slate-100">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-600">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-slate-100 mb-2">Notification Settings</h3>
            <p className="text-slate-400 text-sm sm:text-base">Control how you receive notifications and updates</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
                    </svg>
                    <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Push Notifications</div>
                  </div>
                  <div className="text-sm sm:text-base text-slate-100 mb-2">Receive notifications directly on your device</div>
                  <div className="text-xs text-slate-400">Get instant alerts for payment failures, reminders, and important updates</div>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    pushNotificationsEnabled ? 'bg-amber-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">In-App Notifications</div>
                </div>
                <div className="text-sm sm:text-base text-slate-100 mb-2">Receive alerts within the application</div>
                <div className="text-xs text-slate-400">Always enabled - you'll see notifications in your alerts panel</div>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-700/50">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Always Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Management */}
      <div className="max-w-4xl mx-auto">
        <DeviceManagement />
      </div>

      {/* Upcoming Payments */}
      <div className="max-w-4xl mx-auto">
        <UpcomingPayments />
      </div>

      {/* Data Export */}
      <div className="max-w-4xl mx-auto">
        <DataExport />
      </div>

      {/* Advanced Analytics */}
      <div className="max-w-4xl mx-auto">
        <AdvancedAnalytics key={analyticsKey} />
      </div>

      {/* Support & Messages */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
          <div className="text-center">
            {/* @ts-expect-error Conflicting React types between lucide-react and project */}
            <MessageSquare className="h-12 sm:h-16 md:h-20 w-12 sm:w-16 md:w-20 text-amber-400 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-slate-100 mb-2 sm:mb-4">Support & Messages</h3>
            <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto">
              Need help? Send us a message or contact our support team. We&apos;re here to assist you with any questions or issues.
            </p>
            <button
              onClick={() => setShowMessagingModal(true)}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
            >
              {/* Pulse animation background */}
              <div className="absolute inset-0 rounded-md bg-amber-500 animate-ping opacity-20"></div>
              
              {/* Main button content */}
              <div className="relative flex items-center gap-2">
                {/* @ts-expect-error Conflicting React types between lucide-react and project */}
                <MessageSquare className="h-5 w-5 group-hover:animate-bounce" />
                <span>Open Support & Messages</span>
                
                {/* Notification badge */}
                <div className="ml-2 flex items-center">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="text-center pt-6 sm:pt-8 md:pt-12 border-t border-slate-800 px-2 sm:px-4">
        <div className="text-amber-400/40 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">&quot;</div>
        <p className="text-slate-400 text-base sm:text-lg font-serif italic mb-3 sm:mb-4 max-w-2xl mx-auto">
          Your financial journey is unique. Make it extraordinary.
        </p>
        <div className="text-slate-600 text-sm tracking-widest">&mdash; SPENDFLOW</div>
      </div>

      {/* Support & Messages Modal */}
      <UserAdminMessaging
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfilePageContent />
    </AuthGate>
  );
}
