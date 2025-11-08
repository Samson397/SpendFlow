'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCards } from '@/hooks/useCards';
import { CreateBudgetModal } from '@/components/budgets/CreateBudgetModal';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetService } from '@/lib/services/budgetService';
import { Budget } from '@/types/budget';
import { DashboardAnalytics } from '@/components/analytics/DashboardAnalytics';
import { AuthGate } from '@/components/auth/AuthGate';
import { SwipeableTransactionCard } from '@/components/transactions/SwipeableTransactionCard';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { RecurringExpense } from '@/types/recurring';
import { CardsBreakdownModal } from '@/components/dashboard/CardsBreakdownModal';
import * as Lucide from 'lucide-react';
import { savingsAccountsService } from '@/lib/services/savingsService';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { tier } = useSubscription();

  // Real-time data hooks
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid, { limit: 50 });
  const { cards, loading: cardsLoading } = useCards(user?.uid);

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [recurringExpensesLoading, setRecurringExpensesLoading] = useState(true);
  const [savingsAccounts, setSavingsAccounts] = useState<Array<{ id: string; balance: number; name: string }>>([]);
  const [savingsAccountsLoading, setSavingsAccountsLoading] = useState(true);

  // Check if user is admin
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const [showCardsModal, setShowCardsModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'credit' | 'debit'>('credit');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'income' | 'expense'>('expense');

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasCards = cards.length > 0;
  const loading = transactionsLoading || cardsLoading || recurringExpensesLoading || savingsAccountsLoading;

  // Load recurring expenses
  useEffect(() => {
    if (!user?.uid) return;

    const loadRecurringExpenses = async () => {
      try {
        setRecurringExpensesLoading(true);
        const expenses = await recurringExpensesService.getByUserId(user.uid);
        setRecurringExpenses(expenses);
      } catch (error) {
        console.error('Error loading recurring expenses:', error);
      } finally {
        setRecurringExpensesLoading(false);
      }
    };

    loadRecurringExpenses();
  }, [user?.uid]);

  // Load savings accounts
  useEffect(() => {
    if (!user?.uid) return;

    const loadSavingsAccounts = async () => {
      try {
        setSavingsAccountsLoading(true);
        const accounts = await savingsAccountsService.getUserAccounts(user.uid);
        setSavingsAccounts(accounts.map(account => ({
          id: account.id,
          balance: account.balance,
          name: account.name,
        })));
      } catch (error) {
        console.error('Error loading savings accounts:', error);
      } finally {
        setSavingsAccountsLoading(false);
      }
    };

    loadSavingsAccounts();
  }, [user?.uid]);

  // Calculate upcoming expenses for next 2-3 days based on recurring expenses
  const upcomingExpenses = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Filter recurring expenses that are active and have payment dates in the next 3 days
    return recurringExpenses
      .filter(expense => expense.isActive)
      .map(expense => {
        // Calculate the next payment date for this recurring expense
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const paymentDate = expense.dayOfMonth;

        // Try current month first
        let paymentDateThisMonth = new Date(currentYear, currentMonth, paymentDate);

        // If payment date for current month has passed, use next month
        if (paymentDateThisMonth < now) {
          paymentDateThisMonth = new Date(currentYear, currentMonth + 1, paymentDate);
        }

        // Check if this payment date is within the next 3 days
        if (paymentDateThisMonth >= now && paymentDateThisMonth <= threeDaysFromNow) {
          return {
            id: expense.id,
            description: expense.name, // Use name instead of description
            amount: expense.amount,
            category: expense.category,
            date: paymentDateThisMonth.toISOString(),
            // Add additional fields to match the expected interface
            type: 'expense' as const,
            userId: expense.userId,
            cardId: expense.cardId,
            isRecurring: true
          };
        }

        return null;
      })
      .filter(expense => expense !== null)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime())
      .slice(0, 5); // Show up to 5 upcoming expenses
  }, [recurringExpenses]);

  // Calculate stats reactively from real-time data
  const stats = useMemo(() => {
    // Calculate card balances (BANK LOGIC)
    const creditCards = cards.filter(card => card.type === 'credit');
    const debitCards = cards.filter(card => card.type === 'debit');

    // Credit cards: show available credit (limit - balance)
    const creditBalance = creditCards.reduce((sum: number, card: any) => {
      const limit = card.limit || card.creditLimit || 0;
      return sum + (limit - card.balance);
    }, 0);

    // Debit cards: show actual balance
    const debitBalance = debitCards.reduce((sum: number, card: any) => sum + card.balance, 0);

    // Total available funds
    const totalBalance = debitBalance + creditBalance;

    // Calculate income/expenses from all transactions (not just recent ones)
    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

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
      // Fast navigation to cards page when no cards exist
      router.replace('/cards');
      return;
    }
    setDefaultTransactionType('expense'); // Default to expense for main button
    setShowTransactionModal(true);
  };

  // Load budgets
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = BudgetService.subscribeToBudgets(user.uid, (budgetData) => {
      setBudgets(budgetData);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleBudgetSuccess = useCallback(() => {
    // Refresh budgets will happen automatically through subscription
    console.log('Budget created successfully');
  }, []);

  const handleTransactionSuccess = useCallback(() => {
    // Refresh transactions will happen automatically through useTransactions hook
    console.log('Transaction added successfully');
  }, []);

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await BudgetService.delete(budgetId);
        console.log('Budget deleted successfully');
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => {
                setDefaultTransactionType('expense');
                setShowTransactionModal(true);
              }}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-amber-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-accent)' }}>💰</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Add Expense</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>Track spending</div>
            </button>

            <button
              onClick={() => {
                setDefaultTransactionType('income');
                setShowTransactionModal(true);
              }}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-green-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-success)' }}>💵</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Add Income</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>Record earnings</div>
            </button>

            <button
              onClick={() => router.push('/transactions')}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-blue-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-accent)' }}>📊</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Transactions</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>View history</div>
            </button>

            <button
              onClick={() => setShowBudgetModal(true)}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-purple-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-warning)' }}>🎯</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Create Budget</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>Set limits</div>
            </button>

            <button
              onClick={() => router.push('/ai')}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-amber-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-accent)' }}>🤖</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>AI Assistant</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>Get advice</div>
            </button>

            <button
              onClick={() => router.push('/cards')}
              className="group p-4 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600 hover:border-cyan-500/50 transition-all duration-200 text-center rounded-lg backdrop-blur-sm"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--color-success)' }}>💳</div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Manage Cards</span>
              <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text-tertiary)' }}>Add accounts</div>
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

        {/* Budgets Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-0.5 bg-linear-to-r from-amber-400 to-transparent"></div>
              <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Budget Overview</h2>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md"
            >
              <span className="text-lg">+</span>
              <span className="hidden sm:inline">Create Budget</span>
              <span className="sm:hidden">Budget</span>
            </button>
          </div>

          <div className="backdrop-blur-sm" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
            {budgets.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.slice(0, 6).map((budget) => (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      onEdit={handleEditBudget}
                      onDelete={handleDeleteBudget}
                    />
                  ))}
                </div>

                {budgets.length > 6 && (
                  <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                    <button
                      onClick={() => router.push('/budgets')}
                      className="text-sm tracking-wider uppercase hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      View All {budgets.length} Budgets →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-amber-400 mb-4">
                  <Lucide.Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-80" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-3 font-semibold">No Budgets Yet</h3>
                <p className="text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base tracking-wide px-4 font-medium">
                  Create budgets to track spending limits and reach your financial goals
                </p>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="px-6 py-3 border-2 border-amber-600 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px] font-semibold shadow-lg hover:shadow-amber-500/20"
                >
                  Create Your First Budget
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analytics & Insights */}
        <DashboardAnalytics />

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
              transactions.slice(0, 3).map((transaction: any) => (
                isMobile ? (
                  <SwipeableTransactionCard
                    key={transaction.id}
                    transaction={{
                      id: transaction.id,
                      description: transaction.description,
                      amount: transaction.amount,
                      category: transaction.category,
                      type: transaction.type === 'income' ? 'income' : 'expense',
                      date: typeof transaction.date === 'string' ? transaction.date : transaction.date.toISOString(),
                    }}
                    onEdit={() => {
                      // Could implement edit functionality
                      console.log('Edit transaction:', transaction.id);
                    }}
                    onDelete={() => {
                      if (window.confirm('Delete this transaction?')) {
                        console.log('Delete transaction:', transaction.id);
                        // Could implement delete functionality
                      }
                    }}
                    className="mb-2"
                  />
                ) : (
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
                )
              ))
            ) : (
              <div className="text-center py-12 font-serif" style={{ color: 'var(--color-text-tertiary)' }}>
                No recent transactions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setSelectedBudget(null);
        }}
        onSuccess={handleBudgetSuccess}
        initialCategory={selectedBudget?.category}
      />

      {/* Cards Breakdown Modal */}
      <CardsBreakdownModal
        isOpen={showCardsModal}
        onClose={() => setShowCardsModal(false)}
        cards={cards}
        type={selectedCardType}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={handleTransactionSuccess}
        defaultType={defaultTransactionType}
      />
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
