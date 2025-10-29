'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

type Insight = {
  id: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  value?: string;
};

type InsightsCardProps = {
  totalIncome: number;
  totalExpenses: number;
  categorySpending: Record<string, number>;
  lastMonthExpenses?: number;
};

export function InsightsCard({ 
  totalIncome, 
  totalExpenses, 
  categorySpending,
  lastMonthExpenses = 0 
}: InsightsCardProps) {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const spendingChange = lastMonthExpenses > 0 
      ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;

    // Savings rate insight
    if (savingsRate > 20) {
      insights.push({
        id: '1',
        type: 'success',
        title: 'Great Savings Rate! 🎉',
        description: `You're saving ${savingsRate.toFixed(0)}% of your income this month.`,
        value: `${savingsRate.toFixed(0)}%`
      });
    } else if (savingsRate < 10 && savingsRate > 0) {
      insights.push({
        id: '1',
        type: 'warning',
        title: 'Low Savings Rate',
        description: `You're only saving ${savingsRate.toFixed(0)}% of your income. Try to increase it to 20%.`,
        value: `${savingsRate.toFixed(0)}%`
      });
    }

    // Spending trend insight
    if (spendingChange > 15) {
      insights.push({
        id: '2',
        type: 'warning',
        title: 'Spending Increased',
        description: `Your spending is up ${Math.abs(spendingChange).toFixed(0)}% compared to last month.`,
        value: `+${spendingChange.toFixed(0)}%`
      });
    } else if (spendingChange < -10) {
      insights.push({
        id: '2',
        type: 'success',
        title: 'Spending Decreased! 💰',
        description: `You spent ${Math.abs(spendingChange).toFixed(0)}% less than last month.`,
        value: `-${Math.abs(spendingChange).toFixed(0)}%`
      });
    }

    // Top spending category
    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > 0) {
      const percentage = (topCategory[1] / totalExpenses) * 100;
      insights.push({
        id: '3',
        type: 'info',
        title: `Top Spending: ${topCategory[0]}`,
        description: `${percentage.toFixed(0)}% of your budget goes to ${topCategory[0]}.`,
        value: `$${topCategory[1].toFixed(0)}`
      });
    }

    // Budget health
    if (totalExpenses > totalIncome && totalIncome > 0) {
      insights.push({
        id: '4',
        type: 'danger',
        title: 'Spending Exceeds Income! ⚠️',
        description: `You're spending $${(totalExpenses - totalIncome).toFixed(0)} more than you earn.`,
        value: `-$${(totalExpenses - totalIncome).toFixed(0)}`
      });
    }

    return insights.slice(0, 3); // Return top 3 insights
  };

  const insights = generateInsights();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Add more transactions to see personalized insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border-2 ${getBackgroundColor(insight.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              {insight.value && (
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
