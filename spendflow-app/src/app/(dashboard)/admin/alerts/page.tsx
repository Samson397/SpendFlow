'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import components for better performance
const AlertsPanel = dynamic(() => import('@/components/admin/AlertsPanel'), { ssr: false });

export default function AdminAlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Use same admin check logic as AuthContext - supports multiple admins
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        const userIsAdmin = user.email ? adminEmails.includes(user.email) : false;

        setIsAdmin(userIsAdmin);
        setCheckingAdmin(false);

        if (!userIsAdmin) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setCheckingAdmin(false);
        router.push('/dashboard');
      }
    };

    checkAdminAccess();
  }, [authLoading, user, router]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-serif text-slate-100 tracking-wide">Access Denied</div>
          <p className="mt-2 text-slate-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-serif tracking-wide">ADMIN</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-slate-100 mb-2 tracking-wide">
            System Alerts
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Monitor and manage system alerts and notifications
          </p>
        </div>

        {/* Alerts Panel Component */}
        <AlertsPanel />
      </div>
    </div>
  );
}
