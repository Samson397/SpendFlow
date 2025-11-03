'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingDown, Plus, CreditCard, Calendar, Edit2, Trash2 } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { RecurringExpense } from '@/types/recurring';
import { AddRecurringExpenseModal } from '@/components/recurring/AddRecurringExpenseModal';
import { EditRecurringExpenseModal } from '@/components/recurring/EditRecurringExpenseModal';
import { AuthGate } from '@/components/auth/AuthGate';
import { useToast } from '@/components/ui/use-toast';

function ExpensesPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [hasCards, setHasCards] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadExpenses();
    checkCards();

    // Add window focus listener to re-check cards when returning to page
    const handleFocus = () => {
      checkCards();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const recurringExpenses = await recurringExpensesService.getByUserId(user!.uid);
      setExpenses(recurringExpenses);
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
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    loadExpenses();
  };

  const handleEditExpense = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleDeleteExpense = async (expenseId: string, expenseName: string) => {
    if (!user) return;

    if (!window.confirm(`Are you sure you want to delete "${expenseName}"?`)) {
      return;
    }

    try {
      await recurringExpensesService.delete(expenseId);
      // Refresh the expenses list
      const updatedExpenses = await recurringExpensesService.getByUserId(user.uid);
      setExpenses(updatedExpenses);
      toast({
        title: 'Expense deleted',
        description: 'The recurring expense has been removed.',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the expense. Please try again.',
        variant: 'destructive',
      });
    }
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
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      <AddRecurringExpenseModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />

      <EditRecurringExpenseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingExpense(null);
        }}
        onSuccess={handleSuccess}
        expense={editingExpense}
      />

      {/* No Cards Message */}
      {showNoCardsMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-2 tracking-wide">
                No Cards Found
              </h3>
              <p className="text-slate-400 text-sm tracking-wide">
                Please add a card first before creating expenses
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowNoCardsMessage(false);
                  router.push('/cards');
                }}
                className="w-full px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowNoCardsMessage(false)}
                className="w-full px-6 py-3 border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"></div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide">
            MONTHLY EXPENSES
          </h1>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"></div>
          <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Expenditure Overview</p>
        </div>
        <button
          onClick={handleAddExpenseClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Add Expense
        </button>
      </div>

      {/* Total */}
      <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-3 sm:mb-4 font-serif">Total Expenses</div>
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-100 mb-2">{formatAmount(totalExpenses)}</div>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm tracking-wider">{expenses.length} Recurring Expenses</span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div>
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-8 sm:w-12 h-0.5 bg-linear-to-r from-amber-600 to-transparent"></div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-slate-100 tracking-wide">Monthly Recurring Expenses</h2>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="border-b border-slate-800 py-4 sm:py-6 hover:bg-slate-900/30 transition-colors rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className={`w-1 h-10 sm:h-12 ${expense.isActive ? 'bg-amber-600' : 'bg-slate-600'} rounded-full`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-200 font-serif mb-1 text-sm sm:text-base truncate">{expense.name}</div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-600 tracking-wider flex-wrap">
                        <span className="uppercase">{expense.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Day {expense.dayOfMonth} of month</span>
                        </div>
                        {!expense.isActive && (
                          <>
                            <span>•</span>
                            <span className="text-red-400 font-medium">INACTIVE</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-lg sm:text-xl font-serif text-slate-300">
                      -{formatAmount(expense.amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 rounded transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Edit expense"
                      >
                        <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id, expense.name)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Delete expense"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/30 rounded-lg">
            <div className="text-slate-500 mb-4 text-lg font-serif">No recurring expenses</div>
            <p className="text-slate-600 text-sm tracking-wide">Add monthly subscriptions like Netflix, Spotify, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <AuthGate>
      <ExpensesPageContent />
    </AuthGate>
  );
}
