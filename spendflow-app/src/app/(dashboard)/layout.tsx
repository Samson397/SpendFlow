'use client';

import { ReactNode, useEffect } from 'react';
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  useRecurringExpenseProcessor();

  // Monitor maintenance mode in real-time and redirect if needed
  useEffect(() => {
    if (!user) return; // Don't monitor if no user yet

    console.log('🔧 Setting up real-time maintenance mode monitoring');

    // Check if user is admin (admins can bypass maintenance mode)
    const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
    const isAdmin = user.email ? adminEmails.includes(user.email) : false;

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
      <div className="min-h-screen w-full flex flex-col bg-slate-900">
        <div className="flex flex-1 w-full overflow-hidden flex-col md:flex-row">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <div className="fixed top-0 left-0 right-0 z-40">
              <AnnouncementsBanner />
            </div>
            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full pt-24 md:pt-4">
              <div className="px-3 py-4 sm:px-4 sm:py-6 w-full">
                <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
                  {children}
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
