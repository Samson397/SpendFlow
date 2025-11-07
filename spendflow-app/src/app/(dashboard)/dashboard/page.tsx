'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { CardsBreakdownModal } from '@/components/dashboard/CardsBreakdownModal';
import { AuthGate } from '@/components/auth/AuthGate';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { tier } = useSubscription();

  // Real-time data hooks
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid, { limit: 50 });
  const { cards, loading: cardsLoading } = useCards(user?.uid);

  // Check if user is admin
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const [showCardsModal, setShowCardsModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'credit' | 'debit'>('credit');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [savingsAccounts] = useState<Array<{ id: string; balance: number; name: string }>>([]);

  const hasCards = cards.length > 0;
  const loading = transactionsLoading || cardsLoading;

  // Calculate upcoming expenses for next 2-3 days
  const upcomingExpenses = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const transactionDate = new Date(t.date);
        return transactionDate >= now && transactionDate <= threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Show up to 5 upcoming expenses
  }, [transactions]);

  // Calculate stats reactively from real-time data
  const stats = useMemo(() => {
    // Calculate card balances (BANK LOGIC)
    const creditCards = cards.filter(card => card.type === 'credit');
    const debitCards = cards.filter(card => card.type === 'debit');

    // Credit cards: show available credit (limit - balance)
    const creditBalance = creditCards.reduce((sum, card) => {
      return sum + ((card.limit || 0) - card.balance);
    }, 0);

    // Debit cards: show actual balance
    const debitBalance = debitCards.reduce((sum, card) => sum + card.balance, 0);

    // Total available funds
    const totalBalance = debitBalance + creditBalance;

    // Calculate income/expenses from all transactions (not just recent ones)
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total savings balance
    const totalSavingsBalance = savingsAccounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      totalBalance,
      creditBalance,
      debitBalance,
      creditCardCount: creditCards.length,
      debitCardCount: debitCards.length,
      income,
      expenses,
      savings: totalSavingsBalance,
    };
  }, [cards, transactions, savingsAccounts]);

  const handleAddTransactionClick = async () => {
    if (!hasCards) {
      router.push('/cards');
      return;
    }
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionModal(false);
    // Could add refresh logic here if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-2 tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
              D A S H B O A R D
            </h1>
            <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Financial Overview</p>
          </div>
          <button
            onClick={handleAddTransactionClick}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border transition-colors tracking-wider uppercase text-sm w-full sm:w-auto justify-center"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
          >
            <span className="text-lg">+</span>
            <span className="hidden xs:inline">Add Transaction</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {/* Welcome Message */}
        <div className="text-center py-12">
          <p className="text-lg font-serif italic mb-4 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Welcome to SpendFlow - Your financial dashboard is ready!
          </p>
          <div className="text-sm tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
            — All features unlocked
          </div>
        </div>

        {/* Card Balance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-12">
          <button
            onClick={() => {
              setSelectedCardType('credit');
              setShowCardsModal(true);
            }}
            className="p-6 sm:p-8 backdrop-blur-sm hover:border-blue-600/50 transition-colors text-left relative"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💳</div>
              <div className="text-right">
                <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Credit Cards</div>
                <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{stats.creditCardCount}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif break-all overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                {formatAmount(stats.creditBalance)}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Available Credit</div>
            </div>
            <div className="absolute bottom-4 right-4 text-xs opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>
              Tap to view modal →
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedCardType('debit');
              setShowCardsModal(true);
            }}
            className="p-6 sm:p-8 backdrop-blur-sm hover:border-green-600/50 transition-colors text-left relative"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💰</div>
              <div className="text-right">
                <div className="text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>Debit Cards</div>
                <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>{stats.debitCardCount}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif break-all overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                {formatAmount(stats.debitBalance)}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Available Balance</div>
            </div>
            <div className="absolute bottom-4 right-4 text-xs opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>
              Tap to view modal →
            </div>
          </button>
        </div>

        {/* Income/Expenses Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-12">
          <button
            onClick={() => router.push('/income')}
            className="p-4 sm:p-8 backdrop-blur-sm hover:border-green-600/50 transition-colors text-left"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="border-l-2 pl-4 sm:pl-6" style={{ borderColor: 'var(--color-success)' }}>
              <div className="text-xs tracking-widest uppercase mb-2 sm:mb-3 font-serif" style={{ color: 'var(--color-text-tertiary)' }}>Income</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 break-all overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                {formatAmount(stats.income)}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Revenue</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/expenses')}
            className="p-4 sm:p-8 backdrop-blur-sm hover:border-red-600/50 transition-colors text-left"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <div className="border-l-2 pl-4 sm:pl-6" style={{ borderColor: 'var(--color-error)' }}>
              <div className="text-xs tracking-widest uppercase mb-2 sm:mb-3 font-serif" style={{ color: 'var(--color-text-tertiary)' }}>Expenses</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-2 break-all overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                {formatAmount(stats.expenses)}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Expenditure</div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-serif mb-6" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              className="p-4 backdrop-blur-sm hover:bg-slate-900/50 transition-colors text-center"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              onClick={() => router.push('/cards')}
            >
              <div className="text-2xl mb-2" style={{ color: 'var(--color-accent)' }}>💳</div>
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>My Cards</span>
            </button>
            <button
              className="p-4 backdrop-blur-sm hover:bg-slate-900/50 transition-colors text-center"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              onClick={() => router.push('/transactions')}
            >
              <div className="text-2xl mb-2" style={{ color: 'var(--color-success)' }}>📊</div>
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Transactions</span>
            </button>
            <button
              className="p-4 backdrop-blur-sm hover:bg-slate-900/50 transition-colors text-center"
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
              onClick={() => router.push('/savings')}
            >
              <div className="text-2xl mb-2" style={{ color: 'var(--color-warning)' }}>💰</div>
              <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Savings</span>
            </button>
          </div>
        </div>

        {/* Upcoming Expenses */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5" style={{ backgroundColor: 'var(--color-accent)' }}></div>
            <h2 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)' }}>Upcoming Expenses</h2>
          </div>

          <div className="backdrop-blur-sm p-6" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            {upcomingExpenses.length > 0 ? (
              <div className="space-y-4">
                {upcomingExpenses.map((expense) => {
                  const expenseDate = new Date(expense.date);
                  const today = new Date();
                  const daysDiff = Math.ceil((expenseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const dayText = daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`;

                  return (
                    <div key={expense.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div>
                          <div className="font-serif text-sm" style={{ color: 'var(--color-text-primary)' }}>{expense.description}</div>
                          <div className="text-xs tracking-wider uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                            {expense.category} • {dayText}
                          </div>
                        </div>
                      </div>
                      <div className="font-serif text-lg" style={{ color: 'var(--color-accent)' }}>
                        -{formatAmount(expense.amount)}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={() => router.push('/expenses')}
                    className="w-full text-center py-3 text-sm tracking-wider uppercase hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    View All Expenses →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">📅</div>
                </div>
                <p className="text-slate-400 font-serif">No upcoming expenses</p>
                <p className="text-slate-600 text-sm mt-2">Expenses scheduled for the next 3 days will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5" style={{ backgroundColor: 'var(--color-accent)' }}></div>
            <h2 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)' }}>Portfolio Overview</h2>
          </div>

          <div className="backdrop-blur-sm" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-x" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => router.push('/cards')}
                className="p-4 sm:p-8 text-center hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-3xl mb-2">💳</div>
                <div className="text-2xl sm:text-3xl font-serif mb-2" style={{ color: 'var(--color-text-primary)' }}>{cards.length}</div>
                <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                  {cards.length === 1 ? 'Account' : 'Accounts'}
                </div>
              </button>
              <button
                onClick={() => router.push('/savings')}
                className="p-4 sm:p-8 text-center hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-3xl mb-2">🏦</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-serif mb-2 break-all overflow-hidden text-ellipsis max-w-full" style={{ color: 'var(--color-text-primary)' }}>
                  {formatAmount(stats.savings)}
                </div>
                <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                  {savingsAccounts.length} {savingsAccounts.length === 1 ? 'Account' : 'Accounts'}
                </div>
              </button>
              <button
                onClick={() => router.push('/transactions')}
                className="p-4 sm:p-8 text-center hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl sm:text-3xl font-serif mb-2" style={{ color: 'var(--color-text-primary)' }}>{transactions.length}</div>
                <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                  {transactions.length === 1 ? 'Transaction' : 'Transactions'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-0.5" style={{ backgroundColor: 'var(--color-accent)' }}></div>
              <h2 className="text-2xl font-serif" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h2>
            </div>
            <button
              onClick={() => router.push('/transactions')}
              className="text-sm tracking-wider uppercase hover:opacity-80 transition-opacity"
              style={{ color: 'var(--color-accent)' }}
            >
              View All →
            </button>
          </div>

          <div className="space-y-1">
            {transactions.slice(0, 3).length > 0 ? (
              transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="py-6 hover:bg-slate-900/30 transition-colors" style={{ borderBottomColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-1 h-12" style={{ backgroundColor: transaction.type === 'income' ? 'var(--color-success)' : 'var(--color-accent)' }}></div>
                      <div>
                        <div className="font-serif mb-1" style={{ color: 'var(--color-text-primary)' }}>{transaction.description}</div>
                        <div className="text-xs tracking-wider uppercase" style={{ color: 'var(--color-text-tertiary)' }}>{transaction.category}</div>
                      </div>
                    </div>
                    <div className="font-serif text-lg sm:text-xl break-all max-w-full" style={{ color: transaction.type === 'income' ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 font-serif" style={{ color: 'var(--color-text-tertiary)' }}>
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Cards Breakdown Modal */}
      <CardsBreakdownModal
        isOpen={showCardsModal}
        onClose={() => setShowCardsModal(false)}
        cards={cards}
        type={selectedCardType}
      />
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
