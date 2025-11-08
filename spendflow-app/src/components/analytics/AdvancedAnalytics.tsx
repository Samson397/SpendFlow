'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { transactionsService } from '@/lib/firebase/firestore';
import { Transaction } from '@/types';

interface AnalyticsData {
  monthlySpending: { month: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; color: string }[];
  incomeVsExpenses: { month: string; income: number; expenses: number }[];
  topCategories: { category: string; amount: number; count: number }[];
  spendingTrends: { date: string; amount: number }[];
  averageTransaction: number;
  largestTransaction: Transaction | null;
  totalTransactions: number;
}

const categoryColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

export function AdvancedAnalytics() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { canAccessFeature } = useSubscription();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  const canViewAnalytics = canAccessFeature('analytics');

  useEffect(() => {
    if (user && canViewAnalytics) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, canViewAnalytics, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('AdvancedAnalytics: Loading analytics for user:', user!.uid, 'timeRange:', timeRange);
      const transactions = await transactionsService.getRecentByUserId(user!.uid, 1000);
      console.log('AdvancedAnalytics: Fetched', transactions.length, 'transactions');

      // Filter by time range
      const now = new Date();
      const monthsBack = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

      const filteredTransactions = transactions.filter(t => t.date >= cutoffDate);
      console.log('AdvancedAnalytics: Filtered to', filteredTransactions.length, 'transactions for time range');

      const analyticsData = processAnalytics(filteredTransactions);
      setAnalytics(analyticsData);
      console.log('AdvancedAnalytics: Analytics processed successfully');
    } catch (error) {
      console.error('AdvancedAnalytics: Error loading analytics:', error);

      // Provide more specific error information
      if (error instanceof Error) {
        console.error('AdvancedAnalytics: Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });

        // Check for specific Firebase errors
        if (error.message.includes('quota')) {
          console.error('AdvancedAnalytics: Firebase quota exceeded');
        } else if (error.message.includes('permission')) {
          console.error('AdvancedAnalytics: Permission denied');
        } else if (error.message.includes('unavailable')) {
          console.error('AdvancedAnalytics: Service unavailable');
        }
      }

      // Set analytics to null on error to show error state
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (transactions: Transaction[]): AnalyticsData => {
    // Monthly spending
    const monthlyData: Record<string, number> = {};
    const incomeVsExpenses: Record<string, { income: number; expenses: number }> = {};
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    let totalAmount = 0;
    let largestTransaction: Transaction | null = null;

    transactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM

      // Monthly spending (expenses only)
      if (transaction.type === 'expense') {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
      }

      // Income vs Expenses
      if (!incomeVsExpenses[monthKey]) {
        incomeVsExpenses[monthKey] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        incomeVsExpenses[monthKey].income += transaction.amount;
      } else {
        incomeVsExpenses[monthKey].expenses += transaction.amount;
      }

      // Category breakdown (expenses only)
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        categoryCounts[transaction.category] = (categoryCounts[transaction.category] || 0) + 1;
      }

      // Total and largest transaction
      totalAmount += transaction.amount;
      if (!largestTransaction || transaction.amount > largestTransaction.amount) {
        largestTransaction = transaction;
      }
    });

    // Process monthly spending
    const monthlySpending = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount
      }));

    // Process income vs expenses
    const incomeVsExpensesData = Object.entries(incomeVsExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income: data.income,
        expenses: data.expenses
      }));

    // Process category breakdown
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const categoryBreakdown = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8) // Top 8 categories
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        color: categoryColors[index % categoryColors.length]
      }));

    // Top categories with counts
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        count: categoryCounts[category] || 0
      }));

    // Spending trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions
      .filter(t => t.date >= thirtyDaysAgo && t.type === 'expense')
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const spendingTrends: Record<string, number> = {};
    recentTransactions.forEach(transaction => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      spendingTrends[dateKey] = (spendingTrends[dateKey] || 0) + transaction.amount;
    });

    const spendingTrendsData = Object.entries(spendingTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }));

    return {
      monthlySpending,
      categoryBreakdown,
      incomeVsExpenses: incomeVsExpensesData,
      topCategories,
      spendingTrends: spendingTrendsData,
      averageTransaction: transactions.length > 0 ? totalAmount / transactions.length : 0,
      largestTransaction,
      totalTransactions: transactions.length
    };
  };

  if (!canViewAnalytics) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Advanced Analytics</h3>
          <p className="text-slate-500 mb-4">Get deep insights into your spending patterns and financial trends.</p>
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-md p-4">
            <p className="text-amber-300 text-sm">
              📊 Advanced analytics are available with Pro and Enterprise plans.
              <a href="/subscription" className="text-amber-400 hover:text-amber-300 underline ml-1">
                Upgrade now
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
          <span className="ml-3 text-slate-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics && !loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Analytics Unavailable</h3>
          <p className="text-slate-500 text-sm mb-4">Unable to load analytics data. This may be due to a temporary service issue.</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null; // This should not happen due to the earlier checks, but TypeScript needs it
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-100">Advanced Analytics</h3>
        </div>
        <div className="flex gap-2">
          {(['1M', '3M', '6M', '1Y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Avg Transaction</span>
          </div>
          <div className="text-xl font-bold text-slate-100">{formatAmount(analytics.averageTransaction)}</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Largest Transaction</span>
          </div>
          <div className="text-xl font-bold text-slate-100">
            {analytics.largestTransaction ? formatAmount(analytics.largestTransaction.amount) : formatAmount(0)}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-400">Total Transactions</span>
          </div>
          <div className="text-xl font-bold text-slate-100">{analytics.totalTransactions}</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Categories</span>
          </div>
          <div className="text-xl font-bold text-slate-100">{analytics.categoryBreakdown.length}</div>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <h4 className="text-slate-200 font-semibold mb-4">Monthly Spending Trend</h4>
        <div className="space-y-3">
          {analytics.monthlySpending.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300">{item.month}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((item.amount / Math.max(...analytics.monthlySpending.map(i => i.amount))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <span className="text-slate-300 font-medium w-20 text-right">{formatAmount(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <h4 className="text-slate-200 font-semibold mb-4">Spending by Category</h4>
        <div className="space-y-3">
          {analytics.categoryBreakdown.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-slate-300">{category.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color
                    }}
                  ></div>
                </div>
                <span className="text-slate-300 font-medium w-16 text-right">{category.percentage.toFixed(1)}%</span>
                <span className="text-slate-300 font-medium w-24 text-right">{formatAmount(category.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <h4 className="text-slate-200 font-semibold mb-4">Top Spending Categories</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.topCategories.map((category, index) => (
            <div key={index} className="bg-slate-800/50 p-4 rounded-md">
              <div className="text-slate-300 text-sm mb-1">{category.category}</div>
              <div className="text-xl font-bold text-slate-100 mb-1">{formatAmount(category.amount)}</div>
              <div className="text-slate-500 text-xs">{category.count} transactions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <h4 className="text-slate-200 font-semibold mb-4">Income vs Expenses</h4>
        <div className="space-y-3">
          {analytics.incomeVsExpenses.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300">{item.month}</span>
              <div className="flex items-center gap-4">
                <div className="text-green-400 text-sm">
                  +{formatAmount(item.income)}
                </div>
                <div className="text-red-400 text-sm">
                  -{formatAmount(item.expenses)}
                </div>
                <div className={`text-sm font-medium ${item.income - item.expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatAmount(item.income - item.expenses)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
