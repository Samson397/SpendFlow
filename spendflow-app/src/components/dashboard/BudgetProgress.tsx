'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp } from 'lucide-react';

type BudgetItem = {
  category: string;
  spent: number;
  budget: number;
  color: string;
};

type BudgetProgressProps = {
  budgets: BudgetItem[];
};

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressText = (percentage: number) => {
    if (percentage < 70) return 'On track';
    if (percentage < 90) return 'Approaching limit';
    if (percentage < 100) return 'Near budget';
    return 'Over budget!';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage < 70) return 'text-green-600';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No budgets set yet</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Set your first budget →
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Budget Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budget) * 100;
          const remaining = budget.budget - budget.spent;

          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: budget.color }}
                  />
                  <span className="font-medium text-gray-900">{budget.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">
                    ${budget.spent.toFixed(0)}
                  </span>
                  <span className="text-gray-500"> / ${budget.budget.toFixed(0)}</span>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {percentage > 100 && (
                  <div className="absolute top-0 right-0 h-3 w-2 bg-red-600 rounded-r-full" />
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${getProgressTextColor(percentage)}`}>
                  {getProgressText(percentage)}
                </span>
                <span className={remaining >= 0 ? 'text-gray-600' : 'text-red-600'}>
                  {remaining >= 0 ? `$${remaining.toFixed(0)} left` : `$${Math.abs(remaining).toFixed(0)} over`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Overall summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Total Budget</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-900">
                ${budgets.reduce((sum, b) => sum + b.spent, 0).toFixed(0)}
              </span>
              <span className="text-gray-500">
                {' '}/ ${budgets.reduce((sum, b) => sum + b.budget, 0).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
