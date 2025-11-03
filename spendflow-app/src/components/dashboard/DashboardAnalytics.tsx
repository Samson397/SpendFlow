'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AnalyticsData {
  totalSpent: number;
  totalEarned: number;
  netIncome: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; spent: number; earned: number }[];
  averageTransaction: number;
}

function DashboardAnalytics() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all transactions for the user
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date),
      })) as Array<{
        id: string;
        amount: number;
        type: string;
        category: string;
        date: Date;
      }>;

      // Calculate totals
      const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalEarned = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const netIncome = totalEarned - totalSpent;
      const averageTransaction = transactions.length > 0
        ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length
        : 0;

      // Calculate top categories
      const categoryTotals: { [key: string]: number } = {};
      transactions.forEach(t => {
        if (t.category) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (t.amount || 0);
        }
      });

      const topCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
        }));

      // Calculate monthly trend (last 6 months)
      const monthlyData: { [key: string]: { spent: number; earned: number } } = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7); // YYYY-MM format
      }).reverse();

      last6Months.forEach(month => {
        monthlyData[month] = { spent: 0, earned: 0 };
      });

      transactions.forEach(t => {
        const month = t.date.toISOString().slice(0, 7);
        if (monthlyData[month]) {
          if (t.type === 'expense') {
            monthlyData[month].spent += t.amount || 0;
          } else if (t.type === 'income') {
            monthlyData[month].earned += t.amount || 0;
          }
        }
      });

      const monthlyTrend = last6Months.map(month => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        spent: monthlyData[month].spent,
        earned: monthlyData[month].earned,
      }));

      setAnalytics({
        totalSpent,
        totalEarned,
        netIncome,
        topCategories,
        monthlyTrend,
        averageTransaction,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [loadAnalytics, user]);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-amber-400 text-sm font-serif tracking-wider">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-0.5 bg-linear-to-r from-amber-600 to-transparent"></div>
        <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Financial Insights</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs tracking-widest uppercase mb-2">Total Spent</div>
          <div className="text-xl font-bold text-red-400">{formatAmount(analytics.totalSpent)}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs tracking-widest uppercase mb-2">Total Earned</div>
          <div className="text-xl font-bold text-green-400">{formatAmount(analytics.totalEarned)}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs tracking-widest uppercase mb-2">Net Income</div>
          <div className={`text-xl font-bold ${analytics.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatAmount(analytics.netIncome)}
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs tracking-widest uppercase mb-2">Avg Transaction</div>
          <div className="text-xl font-bold text-amber-400">{formatAmount(analytics.averageTransaction)}</div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-serif text-slate-100 mb-4">Top Spending Categories</h3>
        <div className="space-y-3">
          {analytics.topCategories.length > 0 ? (
            analytics.topCategories.map((cat, index) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center text-sm font-bold text-amber-400">
                    {index + 1}
                  </div>
                  <span className="text-slate-300">{cat.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-slate-100 font-medium">{formatAmount(cat.amount)}</div>
                  <div className="text-xs text-slate-500">{cat.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-4">
              No spending data available yet
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-serif text-slate-100 mb-4">Monthly Trend</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          {analytics.monthlyTrend.map((month) => (
            <div key={month.month} className="text-center">
              <div className="text-xs sm:text-xs text-slate-500 mb-1">{month.month}</div>
              <div className="space-y-1">
                <div className="text-[10px] sm:text-xs text-green-400 font-medium">+{formatAmount(month.earned)}</div>
                <div className="text-[10px] sm:text-xs text-red-400 font-medium">-{formatAmount(month.spent)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DashboardAnalytics };
