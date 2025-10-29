'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { usersService } from '@/lib/firebase/firestore';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCards: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      // Not logged in, redirect to login
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router]);

  const checkAdminStatus = async () => {
    try {
      setCheckingAdmin(true);
      const userProfile = await usersService.get(user!.uid);
      
      if (!userProfile?.isAdmin) {
        // Not an admin, redirect to dashboard
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
      loadStats();
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/dashboard');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const [usersSnap, cardsSnap, transactionsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'cards')),
        getDocs(collection(db, 'transactions')),
      ]);
      
      setStats({
        totalUsers: usersSnap.size,
        totalCards: cardsSnap.size,
        totalTransactions: transactionsSnap.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <div className="text-amber-400 text-lg font-serif tracking-wider">
            {checkingAdmin ? 'Verifying Admin Access...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // If not admin, don't render anything (will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
        <h1 className="text-5xl font-serif text-slate-100 mb-4 tracking-wide">
          A D M I N
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">System Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Users</div>
            </div>
            <div className="text-4xl font-serif text-slate-100">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Cards</div>
            </div>
            <div className="text-4xl font-serif text-slate-100">{stats.totalCards}</div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Transactions</div>
            </div>
            <div className="text-4xl font-serif text-slate-100">{stats.totalTransactions}</div>
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
        <div className="text-center">
          <Shield className="h-16 w-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-slate-100 mb-4">Administrator Access</h2>
          <p className="text-slate-400 tracking-wide max-w-2xl mx-auto">
            You have full administrative privileges. Handle with care and responsibility.
          </p>
        </div>
      </div>
    </div>
  );
}
