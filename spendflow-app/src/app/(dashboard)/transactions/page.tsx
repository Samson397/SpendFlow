'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Plus, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [hasCards, setHasCards] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
    checkCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const transactionsData = await transactionsService.getRecentByUserId(user!.uid, 100);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleAddTransactionClick = () => {
    if (!hasCards) {
      setShowNoCardsMessage(true);
      setTimeout(() => {
        router.push('/cards');
      }, 1500);
      return;
    }
    setShowModal(true);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  const handleSuccess = () => {
    loadData();
  };

  return (
    <div className="space-y-12">
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
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
                Please add a card first before creating transactions
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
      <div className="text-center">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-4 tracking-wide">
          T R A N S A C T I O N S
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Financial Activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Income</div>
            </div>
            <div className="text-4xl font-serif text-slate-100">{formatAmount(totalIncome)}</div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="h-5 w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Expenses</div>
            </div>
            <div className="text-4xl font-serif text-slate-100">{formatAmount(totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between border-t border-b border-slate-800 py-6">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-xs tracking-widest uppercase font-serif">Filter:</span>
          <div className="flex gap-2">
            {['all', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 text-xs tracking-wider uppercase transition-colors ${
                  filterType === type
                    ? 'border border-amber-600 text-amber-400 bg-amber-900/10'
                    : 'border border-slate-700 text-slate-400 hover:border-amber-600/50 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAddTransactionClick}
          className="inline-flex items-center gap-3 px-6 py-2 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-xs"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
          <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Recent Activity</h2>
          <div className="text-slate-600 text-sm">({filteredTransactions.length} transactions)</div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-1">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-1 h-12 ${transaction.type === 'income' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                    <div>
                      <div className="text-slate-200 font-serif mb-1">{transaction.description}</div>
                      <div className="flex items-center gap-4 text-xs text-slate-600 tracking-wider">
                        <span className="uppercase">{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy') : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-serif ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-slate-300'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-slate-800 bg-slate-900/30">
            <div className="text-slate-500 mb-4 text-lg font-serif">No transactions found</div>
            <p className="text-slate-600 text-sm tracking-wide">Start tracking your financial activity</p>
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="text-center py-12 border-t border-slate-800">
        <div className="text-amber-400/40 text-6xl mb-4">&ldquo;</div>
        <p className="text-slate-400 text-lg font-serif italic mb-4 max-w-2xl mx-auto">
          Every transaction tells a story of your financial journey.
        </p>
        <div className="text-slate-600 text-sm tracking-widest">— FINANCIAL WISDOM</div>
      </div>
    </div>
  );
}
