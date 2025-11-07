'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, ArrowLeftIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminCleanupPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Check admin access
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
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
            Data Cleanup
          </h1>
          <p className="text-slate-400 text-sm tracking-wider">
            Reset Firebase database to clean state
          </p>
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8">
          <div className="text-center">
            <CpuChipIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">Data Cleanup Tools</h3>
            <p className="text-slate-400 text-sm mb-6">
              Database cleanup and maintenance functionality would be implemented here.
              This includes data wiping, backup management, and system reset capabilities.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => toast('Data cleanup functionality would be implemented here', { icon: 'ℹ️' })}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Run Data Cleanup
              </button>
              <button
                onClick={() => toast('Database backup functionality would be implemented here', { icon: 'ℹ️' })}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
