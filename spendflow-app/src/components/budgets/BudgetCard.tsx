'use client';

import { Budget } from '@/types/budget';
import { BudgetService } from '@/lib/services/budgetService';
import { useCurrency } from '@/contexts/CurrencyContext';
import * as Lucide from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (budgetId: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { formatAmount } = useCurrency();
  const { percentage, status, remaining, daysLeft } = BudgetService.getBudgetStatus(budget);

  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'danger':
        return 'text-orange-400';
      case 'exceeded':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <Lucide.CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <Lucide.AlertTriangle className="h-4 w-4" />;
      case 'danger':
        return <Lucide.AlertCircle className="h-4 w-4" />;
      case 'exceeded':
        return <Lucide.XCircle className="h-4 w-4" />;
      default:
        return <Lucide.Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-slate-100 truncate">{budget.name}</h3>
          <p className="text-sm text-slate-400">{budget.category}</p>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status === 'exceeded'
                ? 'bg-red-500'
                : status === 'danger'
                ? 'bg-orange-500'
                : status === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Spent</p>
          <p className="font-serif text-slate-100">{formatAmount(budget.spent)}</p>
        </div>
        <div>
          <p className="text-slate-400">Budget</p>
          <p className="font-serif text-slate-100">{formatAmount(budget.amount)}</p>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          {remaining > 0 ? (
            <span className="text-sm text-slate-400">
              {formatAmount(remaining)} left
            </span>
          ) : (
            <span className="text-sm text-red-400">
              {formatAmount(Math.abs(remaining))} over
            </span>
          )}

          {daysLeft > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                {daysLeft} days left
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
              title="Edit budget"
            >
              <Lucide.Edit2 className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete budget"
            >
              <Lucide.Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
