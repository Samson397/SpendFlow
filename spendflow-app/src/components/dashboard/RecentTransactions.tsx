'use client';

import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react';
import { Transaction, Card } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Array<Transaction & { card?: Card | null }>;
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent transactions
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <ArrowUpCircle className="h-5 w-5" />;
      case 'income':
        return <ArrowDownCircle className="h-5 w-5" />;
      case 'refund':
        return <RotateCcw className="h-5 w-5" />;
      default:
        return <ArrowUpCircle className="h-5 w-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'bg-red-100 text-red-600';
      case 'income':
        return 'bg-green-100 text-green-600';
      case 'refund':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'text-red-600';
      case 'income':
        return 'text-green-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-3 rounded-full ${getTransactionColor(transaction.type)}`}>
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>{format(transaction.date, 'MMM d, yyyy')}</span>
                {transaction.card && (
                  <>
                    <span>•</span>
                    <span>•••• {transaction.card.cardNumber?.slice(-4) || '****'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`font-medium text-right ${getAmountColor(transaction.type)}`}>
            <div>{transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}</div>
            <div className="text-xs text-gray-500 font-normal">{transaction.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
