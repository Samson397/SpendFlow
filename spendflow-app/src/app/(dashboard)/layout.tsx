'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { useRecurringExpenseProcessor } from '@/hooks/useRecurringExpenseProcessor';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Automatically process recurring expenses once per day when user logs in
  useRecurringExpenseProcessor();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
