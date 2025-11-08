'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRecurringExpenseProcessor } from '@/hooks/useRecurringExpenseProcessor';
import { AnnouncementsBanner } from '@/components/announcements/AnnouncementsBanner';
import { setupActivityTracking, updateUserActivity } from '@/lib/updateUserActivity';
import { trackUserStatus } from '@/lib/onlineStatus';
import { useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Link from 'next/link';
import { NotificationsBell } from '@/components/notifications/NotificationsBell';
import { useLocationBasedCurrency } from '@/hooks/useLocationBasedCurrency';
import { PullToRefresh } from '@/components/ui/PullToRefresh';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useRecurringExpenseProcessor();
  useLocationBasedCurrency(); // Automatically detect currency based on location

  // Pull-to-refresh function for mobile
  const handlePullToRefresh = useCallback(async () => {
    console.log('🔄 Pull-to-refresh triggered');

    // Force refresh of key data
    try {
      // Trigger any data refreshes needed
      // The real-time hooks should automatically update, but we can force a refresh

      // Add a small delay to show the refresh animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Pull-to-refresh completed');
    } catch (error) {
      console.error('❌ Pull-to-refresh failed:', error);
    }
  }, []);

  // Monitor maintenance mode in real-time and redirect if needed
  useEffect(() => {
    if (!user) return; // Don't monitor if no user yet

    console.log('🔧 Setting up real-time maintenance mode monitoring');

    // Check if user is admin (admins can bypass maintenance mode)
    const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
    const isAdmin = user.email ? adminEmails.includes(user.email) : false;

    // Redirect admins to admin dashboard if they try to access regular user pages
    if (isAdmin && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const regularUserPages = ['/dashboard', '/cards', '/transactions', '/expenses', '/income', '/savings', '/calendar', '/categories', '/profile'];
      
      if (regularUserPages.includes(currentPath)) {
        console.log('🔒 Admin accessing user page, redirecting to admin dashboard');
        router.push('/admin');
        return;
      }
    }

    // Set up real-time listener for maintenance mode changes
    const settingsRef = doc(db, 'settings', 'app');
    const unsubscribe = onSnapshot(settingsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const settings = docSnapshot.data();
          const maintenanceModeActive = settings.maintenanceMode;

          console.log('🔧 Maintenance mode status:', {
            maintenanceModeActive,
            isAdmin,
            currentUser: user.email
          });

          if (maintenanceModeActive && !isAdmin) {
            console.log('🚧 Maintenance mode activated, redirecting non-admin user');
            router.push('/maintenance');
          }
        } else {
          console.log('⚠️ No settings document found, assuming maintenance mode is off');
        }
      },
      (error) => {
        console.error('❌ Error monitoring maintenance mode:', error);
        // Don't redirect on error to prevent blocking users
      }
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up maintenance mode listener');
      unsubscribe();
    };
  }, [user, router]);

  // Set up activity tracking when user is authenticated
  useEffect(() => {
    console.log('Dashboard layout useEffect running, user:', user?.email);
    if (user) {
      console.log('User is authenticated, setting up tracking');
      // Initial activity update
      updateUserActivity();
      
      // Set up periodic activity updates (every 5 minutes)
      const activityInterval = setInterval(updateUserActivity, 5 * 60 * 1000);
      
      // Set up activity tracking for user interactions
      const cleanup = setupActivityTracking();
      
      // Set up online status tracking
      console.log('Calling trackUserStatus');
      const cleanupOnlineStatus = trackUserStatus();
      
      return () => {
        clearInterval(activityInterval);
        cleanup();
        cleanupOnlineStatus();
      };
    } else {
      console.log('No user authenticated');
    }
    return () => {}; // Return empty cleanup function
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="flex flex-1 w-full overflow-hidden flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <div className="fixed top-0 left-0 right-0 z-40">
              <AnnouncementsBanner />
            </div>

            {/* Navigation Header - Always visible */}
            <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md border-b md:left-64 md:z-20" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Spacer for alignment */}
                  <div className="flex-1"></div>

                  {/* User menu - show on all screens */}
                  <div className="flex items-center gap-3">
                    <NotificationsBell />
                    <div className="text-sm text-slate-400 mr-4">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <button
                      onClick={logout}
                      className="text-slate-300 hover:text-amber-400 transition-colors px-3 py-2 text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation Menu - Simplified */}
                {mobileMenuOpen && (
                  <div className="md:hidden border-t border-slate-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/95">
                      <div className="px-3 py-2 text-slate-400 text-sm border-b border-slate-700 mb-2 flex items-center justify-between">
                        <span>Welcome, {user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                        <NotificationsBell className="scale-75" />
                      </div>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 rounded-md"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full pt-16 md:pt-12">
              <PullToRefresh
                onRefresh={handlePullToRefresh}
                className="h-full"
              >
                <div className="px-3 py-4 sm:px-4 sm:py-6 w-full">
                  <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
                    {children}
                  </div>
                </div>
              </PullToRefresh>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
