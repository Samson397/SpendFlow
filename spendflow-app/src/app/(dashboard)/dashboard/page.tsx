'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, Award, Plus, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: any;
  description: string;
};

type CardType = {
  id: string;
  name: string;
  balance: number;
  type: 'credit' | 'debit';
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const hasCards = cards.length > 0;
  const [stats, setStats] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid)
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      
      setTransactions(transactionsData.slice(0, 3));

      // Calculate stats
      const income = transactionsData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expenses = transactionsData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Fetch cards
      const cardsQuery = query(collection(db, 'cards'), where('userId', '==', user.uid));
      const cardsSnapshot = await getDocs(cardsQuery);
      const cardsData = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CardType[];
      
      setCards(cardsData);
      
      const totalBalance = cardsData.reduce((sum, card) => sum + card.balance, 0);
      
      setStats({
        totalBalance,
        income,
        expenses,
        savings: income - expenses,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Pull-to-refresh for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setPullStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pullStartY === 0) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY;
      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, 100));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60) {
        setIsRefreshing(true);
        await fetchData();
        setTimeout(() => setIsRefreshing(false), 500);
      }
      setPullStartY(0);
      setPullDistance(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullStartY, pullDistance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  const handleTransactionSuccess = () => {
    fetchData();
  };

  const handleAddTransactionClick = () => {
    if (!hasCards) {
      setShowNoCardsMessage(true);
      setTimeout(() => {
        router.push('/cards');
      }, 2000);
      return;
    }
    setShowTransactionModal(true);
  };

  return (
    <div className="space-y-12 relative">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-all"
          style={{ transform: `translateY(${pullDistance - 60}px)` }}
        >
          <div className="bg-slate-900/90 backdrop-blur-sm border border-amber-600/30 rounded-full px-4 py-2 flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 text-amber-400 ${pullDistance > 60 ? 'animate-spin' : ''}`} />
            <span className="text-amber-400 text-sm font-serif">
              {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* No Cards Message */}
      {showNoCardsMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-700/30 rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-serif text-slate-100 mb-2 tracking-wide">No Cards Found</h3>
              <p className="text-slate-400 text-sm">
                You need to add a payment card before creating transactions.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent"></div>
              <span className="text-sm tracking-wider">Redirecting to Cards page...</span>
            </div>
          </div>
        </div>
      )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-2 tracking-wide">
              D A S H B O A R D
            </h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase">Financial Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 border border-slate-700 text-slate-400 hover:border-amber-600 hover:text-amber-400 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAddTransactionClick}
              className="flex items-center gap-2 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-sm p-12 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-4 font-serif">Total Balance</div>
              <div className="text-7xl font-serif text-slate-100 mb-2">{formatAmount(stats.totalBalance)}</div>
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm tracking-wider">Across {cards.length} Accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => router.push('/income')}
            className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm hover:border-green-600/50 transition-colors text-left"
          >
            <div className="border-l-2 border-amber-600 pl-6">
              <div className="text-slate-500 text-xs tracking-widest uppercase mb-3 font-serif">Income</div>
              <div className="text-4xl font-serif text-slate-100 mb-2">{formatAmount(stats.income)}</div>
              <div className="text-slate-600 text-sm">Total Revenue</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/expenses')}
            className="border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm hover:border-amber-600/50 transition-colors text-left"
          >
            <div className="border-l-2 border-amber-600 pl-6">
              <div className="text-slate-500 text-xs tracking-widest uppercase mb-3 font-serif">Expenses</div>
              <div className="text-4xl font-serif text-slate-100 mb-2">{formatAmount(stats.expenses)}</div>
              <div className="text-slate-600 text-sm">Total Expenditure</div>
            </div>
          </button>
        </div>

        {/* Portfolio Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Portfolio Overview</h2>
          </div>

          <div className="border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="grid grid-cols-3 divide-x divide-slate-800">
              <button
                onClick={() => router.push('/cards')}
                className="p-8 text-center hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-amber-400 mb-3">
                  <Award className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">{cards.length}</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Accounts</div>
              </button>
              <div className="p-8 text-center">
                <div className="text-amber-400 mb-3">
                  <div className="text-3xl">◆</div>
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">{formatAmount(stats.savings)}</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Savings</div>
              </div>
              <button
                onClick={() => router.push('/transactions')}
                className="p-8 text-center hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-amber-400 mb-3">
                  <div className="text-3xl">★</div>
                </div>
                <div className="text-3xl font-serif text-slate-100 mb-2">{transactions.length}</div>
                <div className="text-slate-500 text-xs tracking-widest uppercase">Transactions</div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
              <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Recent Activity</h2>
            </div>
            <button
              onClick={() => router.push('/transactions')}
              className="text-sm text-amber-400 hover:text-amber-300 tracking-wider uppercase"
            >
              View All →
            </button>
          </div>

          <div className="space-y-1">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="border-b border-slate-800 py-6 hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-1 h-12 ${transaction.type === 'income' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                      <div>
                        <div className="text-slate-200 font-serif mb-1">{transaction.description}</div>
                        <div className="text-slate-600 text-xs tracking-wider uppercase">{transaction.category}</div>
                      </div>
                    </div>
                    <div className={`font-serif text-xl ${transaction.type === 'income' ? 'text-green-400' : 'text-slate-300'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 font-serif">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Quote */}
        <div className="text-center py-12 border-t border-slate-800">
          <div className="text-amber-400/40 text-6xl mb-4">"</div>
          <p className="text-slate-400 text-lg font-serif italic mb-4 max-w-2xl mx-auto">
            Wealth consists not in having great possessions, but in having few wants.
          </p>
          <div className="text-slate-600 text-sm tracking-widest">— EPICTETUS</div>
        </div>
    </div>
  );
}
