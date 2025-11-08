'use client';

import { useState } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useCurrency } from '@/contexts/CurrencyContext';
import * as Lucide from 'lucide-react';

interface SwipeableTransactionCardProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeableTransactionCard({
  transaction,
  onEdit,
  onDelete,
  className = ''
}: SwipeableTransactionCardProps) {
  const { formatAmount } = useCurrency();
  const [showActions, setShowActions] = useState(false);

  const { swipeOffset, handlers } = useSwipeGesture({
    onSwipeLeft: () => {
      setShowActions(true);
      onDelete?.();
    },
    onSwipeRight: () => {
      setShowActions(true);
      onEdit?.();
    },
    leftAction: {
      label: 'Delete',
      color: 'bg-red-500',
      icon: '🗑️',
    },
    rightAction: {
      label: 'Edit',
      color: 'bg-blue-500',
      icon: '✏️',
    },
  });

  const isExpense = transaction.type === 'expense';

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Action backgrounds */}
      <div className="absolute inset-y-0 left-0 w-20 bg-blue-500 flex items-center justify-center">
        <div className="text-white font-medium text-sm">Edit</div>
      </div>
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
        <div className="text-white font-medium text-sm">Delete</div>
      </div>

      {/* Main card */}
      <div
        className={`relative bg-slate-800 border border-slate-700 p-4 transition-transform duration-200 ease-out ${
          showActions ? 'translate-x-0' : ''
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: showActions ? 'none' : 'transform 0.3s ease-out',
        }}
        {...handlers}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-serif text-slate-100 truncate mb-1">
                {transaction.description}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 uppercase tracking-wider">
                  {transaction.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className={`font-serif text-lg shrink-0 ${
            isExpense ? 'text-red-400' : 'text-green-400'
          }`}>
            {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
          </div>
        </div>

        {/* Swipe hint for mobile */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30 pointer-events-none lg:hidden">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Lucide.ChevronsLeft className="h-3 w-3" />
            <span>Swipe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
