'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { SpendingChart } from '@/components/charts/SpendingChart';
import { TrendChart } from '@/components/charts/TrendChart';
import * as Lucide from 'lucide-react';

interface DashboardAnalyticsProps {
  className?: string;
}

export function DashboardAnalytics({ className = '' }: DashboardAnalyticsProps) {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid, { limit: 100 });

  const analytics = useMemo(() => {
    if (!transactions.length) {
      return {
        spendingByCategory: [],
        monthlyTrends: [],
        totalSpent: 0,
        topCategories: [],
      };
    }

    // Calculate spending by category (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t =>
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    );

    const categoryTotals = recentTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    const spendingByCategory = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
        color: getCategoryColor(category),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        new Date(t.date) >= monthStart &&
        new Date(t.date) <= monthEnd
      );

      const monthTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

      monthlyTrends.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: monthTotal,
      });
    }

    const topCategories = spendingByCategory.slice(0, 3);

    return {
      spendingByCategory,
      monthlyTrends,
      totalSpent,
      topCategories,
    };
  }, [transactions]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Analytics Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-0.5 bg-linear-to-r from-amber-400 to-transparent"></div>
        <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Financial Insights</h2>
        <div className="w-12 h-0.5 bg-linear-to-r from-transparent to-amber-400"></div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-amber-400 mb-4">
            <Lucide.BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-80" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-3 font-semibold">No Data Yet</h3>
          <p className="text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base tracking-wide px-4 font-medium">
            Add some transactions to see your spending insights and trends
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-2xl mb-2 text-amber-400">📊</div>
              <div className="text-2xl font-serif text-slate-100 mb-1">
                {analytics.topCategories.length}
              </div>
              <div className="text-sm text-slate-400">Spending Categories</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-2xl mb-2 text-green-400">📈</div>
              <div className="text-2xl font-serif text-slate-100 mb-1">
                {analytics.monthlyTrends.length > 1 ?
                  `${(((analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.amount || 0) - (analytics.monthlyTrends[analytics.monthlyTrends.length - 2]?.amount || 0)) / (analytics.monthlyTrends[analytics.monthlyTrends.length - 2]?.amount || 1) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <div className="text-sm text-slate-400">Monthly Change</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-2xl mb-2 text-blue-400">🎯</div>
              <div className="text-2xl font-serif text-slate-100 mb-1">
                {analytics.topCategories[0]?.category || 'None'}
              </div>
              <div className="text-sm text-slate-400">Top Category</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <SpendingChart
              data={analytics.spendingByCategory}
              title="Spending Breakdown (Last 30 Days)"
            />

            <TrendChart
              data={analytics.monthlyTrends}
              title="Monthly Spending Trends"
            />
          </div>

          {/* Insights */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-serif text-slate-100 mb-4 flex items-center gap-2">
              <Lucide.Lightbulb className="h-5 w-5 text-amber-400" />
              AI Insights
            </h3>

            <div className="space-y-3">
              {analytics.topCategories.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-amber-400 mt-0.5">💡</div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      Your biggest expense is {analytics.topCategories[0].category}
                    </div>
                    <div className="text-sm text-slate-400">
                      Consider reviewing your {analytics.topCategories[0].category.toLowerCase()} spending to optimize your budget.
                    </div>
                  </div>
                </div>
              )}

              {analytics.monthlyTrends.length > 2 && (
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-blue-400 mt-0.5">📈</div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">
                      Spending trend analysis
                    </div>
                    <div className="text-sm text-slate-400">
                      Your spending has {analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.amount > analytics.monthlyTrends[0]?.amount ? 'increased' : 'decreased'} over the last 6 months.
                      {analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.amount > analytics.monthlyTrends[0]?.amount ? ' Consider reviewing your budget.' : ' Great job maintaining control!'}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="text-green-400 mt-0.5">🎯</div>
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Budget recommendation
                  </div>
                  <div className="text-sm text-slate-400">
                    Create a budget for your top spending categories to better track and control your expenses.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Food': '#ef4444', // red
    'Transportation': '#3b82f6', // blue
    'Entertainment': '#8b5cf6', // purple
    'Shopping': '#f59e0b', // amber
    'Utilities': '#06b6d4', // cyan
    'Healthcare': '#10b981', // emerald
    'Education': '#6366f1', // indigo
    'Travel': '#ec4899', // pink
    'Bills': '#84cc16', // lime
    'Other': '#6b7280', // gray
  };

  return colors[category] || '#6b7280';
}
