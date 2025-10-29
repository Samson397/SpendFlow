'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingDown, Plus, CreditCard } from 'lucide-react';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { Transaction } from '@/types';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';

export default function ExpensesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasCards, setHasCards] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadExpenses();
    checkCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const transactions = await transactionsService.getRecentByUserId(user!.uid, 100);
      setExpenses(transactions.filter(t => t.type === 'expense'));
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCards = async () => {
    try {
      const cards = await cardsService.getByUserId(user!.uid);
      setHasCards(cards.length > 0);
    } catch (error) {
      console.error('Error checking cards:', error);
    }
  };

  const handleAddExpenseClick = () => {
    if (!hasCards) {
      setShowNoCardsMessage(true);
      setTimeout(() => {
        router.push('/cards');
      }, 1500);
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    loadExpenses();
  };

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <AddTransactionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        defaultType="expense"
      />

      {/* No Cards Message */}
      {showNoCardsMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">
                No Cards Found
              </h3>
              <p className="text-slate-400 text-sm tracking-wide">
                Please add a card first before creating expenses
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent"></div>
                <span className="text-sm tracking-wider">Redirecting to Cards page...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-2 tracking-wide">
            MONTHLY EXPENSES
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Expenditure Overview</p>
        </div>
        <button
          onClick={handleAddExpenseClick}
          className="flex items-center gap-2 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-4 font-serif">Total Expenses</div>
          <div className="text-6xl font-serif text-slate-100 mb-2">{formatAmount(totalExpenses)}</div>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm tracking-wider">{expenses.length} Transactions</span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
          <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Recent Expenses</h2>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-1">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-1 h-12 bg-amber-600"></div>
                    <div>
                      <div className="text-slate-200 font-serif mb-1">{expense.description}</div>
                      <div className="text-xs text-slate-600 tracking-wider uppercase">{expense.category}</div>
                    </div>
                  </div>
                  <div className="text-xl font-serif text-slate-300">
                    -{formatAmount(expense.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-slate-800 bg-slate-900/30">
            <div className="text-slate-500 mb-4 text-lg font-serif">No expenses recorded</div>
            <p className="text-slate-600 text-sm tracking-wide">Your expense tracking will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
