'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRecurringExpenseProcessor } from '@/hooks/useRecurringExpenseProcessor';
import { AnnouncementsBanner } from '@/components/announcements/AnnouncementsBanner';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useRecurringExpenseProcessor();

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
