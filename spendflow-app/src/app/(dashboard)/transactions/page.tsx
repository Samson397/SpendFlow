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
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import { AuthGate } from '@/components/auth/AuthGate';

function TransactionsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hasCards, setHasCards] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleAddTransactionClick = async () => {
    try {
      const cards = await cardsService.getCardsByUserId(user!.uid);
      if (cards.length === 0) {
        setShowNoCardsMessage(true);
        return;
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error checking cards:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      checkCards();
    }
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

  const handleAddTransaction = () => {
    if (!hasCards) {
      setShowNoCardsMessage(true);
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
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-8 sm:space-y-10 md:space-y-12">
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        transaction={selectedTransaction}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
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
      <div className="text-center sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-800 md:bg-transparent md:backdrop-blur-none md:border-0 md:py-0 md:static">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4 md:mb-8"></div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-2 md:mb-4 tracking-wide">
          <span className="md:hidden">TRANSACTIONS</span>
          <span className="hidden md:inline">T R A N S A C T I O N S</span>
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs md:text-sm tracking-widest uppercase">Financial Activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-4 sm:pl-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Income</div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100">{formatAmount(totalIncome)}</div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="border-l-2 border-amber-600 pl-4 sm:pl-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              <div className="text-slate-500 text-xs tracking-widest uppercase font-serif">Total Expenses</div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100">{formatAmount(totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-t border-b border-slate-800 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <label htmlFor="filter-select" className="text-slate-500 text-xs tracking-widest uppercase font-serif">Filter:</label>
          <select
            id="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors text-xs tracking-wider uppercase"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        <button 
          onClick={handleAddTransactionClick}
          className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-xs"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
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
              <button
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className="w-full border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors text-left"
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
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-serif ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-slate-300'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransactionClick(transaction);
                        }}
                        className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                        aria-label="Edit transaction"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this transaction?')) {
                            try {
                              await transactionsService.deleteTransaction(transaction.id!);
                              loadData();
                            } catch (error) {
                              console.error('Error deleting transaction:', error);
                            }
                          }
                        }}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                        aria-label="Delete transaction"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </button>
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

export default function TransactionsPage() {
  return (
    <AuthGate>
      <TransactionsPageContent />
    </AuthGate>
  );
}
