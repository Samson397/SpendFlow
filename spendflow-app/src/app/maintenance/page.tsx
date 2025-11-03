'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, Clock, Mail, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔧 Setting up real-time maintenance mode monitoring on maintenance page');

    // Set up real-time listener for maintenance mode changes
    const settingsRef = doc(db, 'settings', 'app');
    const unsubscribe = onSnapshot(settingsRef,
      (docSnapshot) => {
        try {
          // Check if user is admin (allow admins to bypass maintenance)
          if (user) {
            const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
            const isAdmin = user.email ? adminEmails.includes(user.email) : false;

            if (isAdmin) {
              console.log('👑 Admin user detected on maintenance page, bypassing to dashboard');
              // Admin can access the app even in maintenance mode
              router.push('/dashboard');
              return;
            }
          }

          if (docSnapshot.exists()) {
            const appSettings = docSnapshot.data();
            const maintenanceModeActive = appSettings.maintenanceMode;

            console.log('🔧 Maintenance page status:', {
              maintenanceModeActive,
              hasSettings: true,
              userEmail: user?.email
            });

            if (!maintenanceModeActive) {
              console.log('🔧 Maintenance mode disabled, redirecting user to dashboard');
              // Maintenance mode is off, redirect to normal app
              router.push('/dashboard');
              return;
            }

            // Maintenance mode is active, show maintenance page
            setSettings(appSettings);
          } else {
            console.log('⚠️ No settings document found on maintenance page, assuming maintenance mode is off');
            // No settings found, assume maintenance mode is off
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('❌ Error in maintenance page monitoring:', error);
          // On error, allow access to prevent blocking users
          router.push('/dashboard');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Error monitoring maintenance mode on maintenance page:', error);
        // On error, allow access to prevent blocking users
        router.push('/dashboard');
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up maintenance page listener');
      unsubscribe();
    };
  }, [user, router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <Wrench className="h-8 w-8 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">System Maintenance</h1>
        <p className="text-slate-400 mb-6">
          We're currently performing scheduled maintenance to improve your experience.
        </p>

        {/* Status Card */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/50">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-300 mb-2">
            <Clock className="h-4 w-4" />
            <span>Expected Duration</span>
          </div>
          <p className="text-amber-400 font-medium">A few hours</p>
        </div>

        {/* Contact Info */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/50">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-300 mb-2">
            <Mail className="h-4 w-4" />
            <span>Need Help?</span>
          </div>
          <a
            href="mailto:spendflowapp@gmail.com"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            spendflowapp@gmail.com
          </a>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Check Again</span>
        </button>

        {/* Footer */}
        <p className="text-xs text-slate-500 mt-6">
          Thank you for your patience while we work to make SpendFlow better.
        </p>
      </div>
    </div>
  );
}
