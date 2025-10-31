import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction & { card?: { name?: string; lastFour?: string } };
  onEdit: () => void;
  onDelete: () => void;
  isDemo?: boolean;
}

export function TransactionItem({ 
  transaction, 
  onEdit, 
  onDelete, 
  isDemo = false 
}: TransactionItemProps) {
  const amount = formatCurrency(transaction.amount);
  const isExpense = transaction.type === 'expense';
  const amountClass = isExpense ? 'text-red-400' : 'text-green-400';
  const sign = isExpense ? '-' : '+';
  
  const cardInfo = transaction.card 
    ? `${transaction.card.name?.split(' ')[0] || 'Card'} •••• ${transaction.card.lastFour || '****'}`
    : 'Unknown Card';

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800/70 rounded-lg p-4 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isExpense ? 'bg-red-500/10' : 'bg-green-500/10'
            }`}>
              {isExpense ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{transaction.description}</h3>
              <div className="flex items-center mt-1 text-xs text-slate-400">
                <span>{formatDate(transaction.date)}</span>
                <span className="mx-2">•</span>
                <span className="truncate">{cardInfo}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <p className={`text-sm font-semibold ${amountClass}`}>
            {sign} {amount}
          </p>
          <p className="text-xs text-slate-500 text-right mt-1">
            {transaction.category}
          </p>
        </div>
      </div>

      {isDemo && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-full bg-slate-700/80 hover:bg-slate-600/80 transition-colors"
            aria-label="Edit transaction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-full bg-slate-700/80 hover:bg-slate-600/80 transition-colors"
            aria-label="Delete transaction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
