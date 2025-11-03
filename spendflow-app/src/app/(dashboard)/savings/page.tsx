'use client';

import { useState, useLayoutEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SavingsAccountsList } from '@/components/savings/SavingsAccountsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SavingsPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view your savings accounts.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      <div className="text-center px-2 sm:px-4">
        <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide">
          S A V I N G S
        </h1>
        <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Savings & Checking Accounts</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 rounded-lg">
        <SavingsAccountsList />
      </div>

      {/* Quote */}
      <div className="text-center pt-6 sm:pt-8 md:pt-12 border-t border-slate-800 px-2 sm:px-4">
        <p className="text-slate-500 text-xs sm:text-sm font-serif italic max-w-2xl mx-auto">
          &quot;Save today for the dreams of tomorrow.&quot;
        </p>
      </div>
    </div>
  );
}
