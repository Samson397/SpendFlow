'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { AuthGate } from '@/components/auth/AuthGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { DataExport } from '@/components/export/DataExport';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { TeamCollaboration } from '@/components/team/TeamCollaboration';
import { UserAdminMessaging } from '@/components/messaging/UserAdminMessaging';
import { DeviceManagement } from '@/components/profile/DeviceManagement';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

function ProfilePageContent() {
  const { user } = useAuth();
  const { theme } = useSubscription();
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [analyticsKey, setAnalyticsKey] = useState(0); // Force analytics re-render
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);

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
                    <Check className="h-4 w-4" />
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingName}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Email</div>
                </div>
                <div className="text-base sm:text-lg font-serif text-slate-100">{user?.email}</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Account Status</div>
                </div>
                <div className="text-base sm:text-lg font-serif text-slate-100">{theme.name} Plan</div>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 rounded-lg">
              <div className="border-l-2 border-amber-600 pl-3 sm:pl-4 md:pl-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
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

      {/* Subscription Management */}
      <div className="max-w-4xl mx-auto">
        <SubscriptionManager />
      </div>

      {/* Device Management */}
      <div className="max-w-4xl mx-auto">
        <DeviceManagement />
      </div>

      {/* Data Export */}
      <div className="max-w-4xl mx-auto">
        <DataExport />
      </div>

      {/* Advanced Analytics */}
      <div className="max-w-4xl mx-auto">
        <AdvancedAnalytics key={analyticsKey} />
      </div>

      {/* Team Collaboration */}
      <div className="max-w-4xl mx-auto">
        <TeamCollaboration />
      </div>

      {/* Support & Messages */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
          <div className="text-center">
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
