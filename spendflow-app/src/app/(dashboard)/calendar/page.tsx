'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ChevronLeft, ChevronRight, Clock, CreditCard, Trash2 } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { RecurringExpense } from '@/types/recurring';
import { Card } from '@/types';
import { AuthGate } from '@/components/auth/AuthGate';
import { useToast } from '@/components/ui/use-toast';

function CalendarPageContent() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [creditCards, setCreditCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    // Check if the device supports touch events
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load recurring expenses
      const expenses = await recurringExpensesService.getByUserId(user!.uid);
      setRecurringExpenses(expenses.filter(e => e.isActive));
      
      // Load credit cards with payment due dates
      const cards = await cardsService.getByUserId(user!.uid);
      const creditCardsWithDueDate = cards.filter(c => 
        c.type === 'credit' && c.isActive && c.paymentDueDay
      );
      setCreditCards(creditCardsWithDueDate);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getRecurringExpensesForDay = (day: number) => {
    return recurringExpenses.filter(expense => expense.dayOfMonth === day);
  };

  const getCreditCardPaymentsForDay = (day: number) => {
    return creditCards.filter(card => card.paymentDueDay === day);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const deleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    try {
      await recurringExpensesService.delete(expenseId);
      // Refresh the data after deletion
      const expenses = await recurringExpensesService.getByUserId(user.uid);
      setRecurringExpenses(expenses.filter(e => e.isActive));
      toast({
        title: 'Expense deleted',
        description: 'The recurring expense has been removed.',
      });
      // Close the expanded view
      setExpandedDay(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Touch gesture handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDevice || touchStartX === null || touchStartY === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes (ignore vertical swipes)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous month
        previousMonth();
      } else {
        // Swipe left - next month
        nextMonth();
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDay = today.getDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }


  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 px-2 sm:px-4 max-w-7xl mx-auto" data-touch={isTouchDevice ? 'true' : 'false'}>
      {/* Header - More compact on mobile */}
      <div className="text-center px-2 sm:px-4">
        <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-8"></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-2 sm:mb-4 tracking-wide">
          C A L E N D A R
        </h1>
        <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
        <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Recurring Payments Schedule</p>
      </div>

      {/* Month Navigation - Better mobile layout */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-1 sm:px-0">
        <button
          onClick={previousMonth}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-slate-700 text-slate-300 hover:border-amber-600/50 hover:text-amber-400 transition-all touch-manipulation min-h-[40px] sm:min-h-[44px] md:min-h-auto rounded-md"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span className="font-serif tracking-wider text-xs sm:text-sm md:text-base hidden xs:inline">Previous</span>
        </button>

        <div className="text-center px-2 sm:px-4 flex-1 max-w-xs sm:max-w-sm">
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-slate-100 tracking-wide">
            {monthNames[month]} {year}
          </div>
          <div className="text-slate-500 text-xs sm:text-sm tracking-wider mt-0.5 sm:mt-1 md:mt-2">
            {recurringExpenses.length} Recurring • {creditCards.length} Cards
          </div>
          {isTouchDevice && (
            <div className="text-slate-600 text-xs mt-0.5 sm:mt-1">
              Swipe to navigate
            </div>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-slate-700 text-slate-300 hover:border-amber-600/50 hover:text-amber-400 transition-all touch-manipulation min-h-[40px] sm:min-h-[44px] md:min-h-auto rounded-md"
        >
          <span className="font-serif tracking-wider text-xs sm:text-sm md:text-base hidden xs:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </button>
      </div>

      {/* Calendar Grid - Improved mobile responsiveness */}
      <div
        ref={calendarRef}
        className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mx-auto max-w-full overflow-x-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Day Headers - More compact on mobile */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3 xl:gap-4 mb-2 sm:mb-3 md:mb-4 min-w-[280px] sm:min-w-0">
          {dayNames.map(day => (
            <div key={day} className="text-center p-1">
              <div className="text-amber-400 text-xs sm:text-sm tracking-widest uppercase font-serif py-0.5 sm:py-1 md:py-2">
                {isTouchDevice ? day.charAt(0) : day}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Days - Better mobile spacing and sizing */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3 xl:gap-4 min-w-[280px] sm:min-w-0">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square sm:aspect-4/3 md:aspect-square min-h-[45px] sm:min-h-[50px] md:min-h-[60px] lg:min-h-[70px]"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const expensesForDay = getRecurringExpensesForDay(day);
            const creditCardPayments = getCreditCardPaymentsForDay(day);
            const isToday = isCurrentMonth && day === currentDay;
            const hasItems = expensesForDay.length > 0 || creditCardPayments.length > 0;
            const isExpanded = expandedDay === day;

            return (
              <div
                key={day}
                className={`relative ${
                  isTouchDevice
                    ? 'aspect-4/3 min-h-[45px] sm:min-h-[50px]'
                    : 'aspect-square min-h-[45px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px]'
                } border ${
                  isToday
                    ? 'border-amber-600 bg-amber-900/20'
                    : isExpanded
                    ? 'border-amber-500 bg-amber-900/30'
                    : 'border-slate-800 bg-slate-900/30'
                } p-0.5 sm:p-1 md:p-1.5 lg:p-2 hover:border-amber-600/50 focus:border-amber-600/50 active:border-amber-600/50 transition-all rounded-sm ${
                  hasItems ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (hasItems) {
                    setExpandedDay(isExpanded ? null : day);
                  }
                }}
                onTouchStart={(e) => {
                  if (!isTouchDevice) return;
                  const target = e.currentTarget as HTMLElement;
                  if (target) {
                    target.classList.add('bg-slate-800/50');
                  }
                }}
                onTouchEnd={(e) => {
                  if (!isTouchDevice) return;
                  setTimeout(() => {
                    const target = e.currentTarget as HTMLElement;
                    if (target) {
                      target.classList.remove('bg-slate-800/50');
                    }
                  }, 200);
                }}
                tabIndex={hasItems ? 0 : -1}
              >
                <div className={`text-xs sm:text-sm font-serif font-medium ${
                  isToday ? 'text-amber-400' : 'text-slate-300'
                } mb-0.5 sm:mb-1 leading-tight`}>
                  {day}
                </div>

                {hasItems && (
                  <div className="space-y-0.5">
                    {/* Recurring Expenses */}
                    {expensesForDay.slice(0, isTouchDevice ? 2 : 1).map((expense, idx) => (
                      <div
                        key={`expense-${idx}`}
                        className="text-[10px] sm:text-xs px-0.5 py-0.5 border-l-2 border-red-500 bg-red-900/20 text-red-300 truncate rounded"
                        title={isTouchDevice ? undefined : `${expense.name} - ${formatAmount(expense.amount)}`}
                      >
                        <div className="flex items-center gap-0.5">
                          <Clock className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                          <span className="truncate text-[10px] sm:text-xs">{expense.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Credit Card Payments */}
                    {creditCardPayments.slice(0, isTouchDevice ? 2 : 1).map((card, idx) => (
                      <div
                        key={`card-${idx}`}
                        className="text-[10px] sm:text-xs px-0.5 py-0.5 border-l-2 border-blue-500 bg-blue-900/20 text-blue-300 truncate rounded"
                        title={isTouchDevice ? undefined : `${card.name} Payment Due`}
                      >
                        <div className="flex items-center gap-0.5">
                          <CreditCard className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
                          <span className="truncate text-[10px] sm:text-xs">{isTouchDevice ? 'Payment' : `${card.name} Payment`}</span>
                        </div>
                      </div>
                    ))}

                    {/* Mobile indicator */}
                    {isTouchDevice && hasItems && (
                      <div className="flex items-center justify-center mt-0.5">
                        <div className="text-[9px] text-slate-400 opacity-60 bg-slate-700/30 px-1 py-0.5 rounded">
                          Tap
                        </div>
                      </div>
                    )}

                    {/* Count indicator for desktop */}
                    {!isTouchDevice && (expensesForDay.length + creditCardPayments.length) > 1 && (
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <div className="px-1 py-0.5 bg-slate-700/50 rounded text-[9px]">
                          <span className="text-amber-400 font-medium">
                            {expensesForDay.length + creditCardPayments.length}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Overflow indicator */}
                    {(expensesForDay.length + creditCardPayments.length) > (isTouchDevice ? 4 : 2) && (
                      <div className="text-[9px] text-slate-500 text-center mt-0.5">
                        +{(expensesForDay.length + creditCardPayments.length) - (isTouchDevice ? 4 : 2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded details - Better mobile positioning */}
                {hasItems && isExpanded && (
                  <div className={`absolute left-1/2 top-full mt-1 sm:mt-2 transform -translate-x-1/2 ${
                    isTouchDevice ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-64'
                  } bg-slate-800 border border-slate-700 p-2 sm:p-3 z-20 shadow-lg rounded-md`}>
                    <div className="text-xs text-amber-400 mb-2 font-serif tracking-wider">
                      {monthNames[month]} {day}, {year}
                    </div>

                    {/* Summary for multiple items */}
                    {(expensesForDay.length + creditCardPayments.length) > 1 && (
                      <div className="mb-2 sm:mb-3 p-2 bg-slate-700/50 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 font-medium">Summary:</span>
                          <span className="text-amber-400 font-medium">
                            {expensesForDay.length + creditCardPayments.length} items
                          </span>
                        </div>
                        {expensesForDay.length > 0 && (
                          <div className="flex items-center justify-between text-red-400">
                            <span>💰 Expenses:</span>
                            <span>{formatAmount(expensesForDay.reduce((sum, exp) => sum + exp.amount, 0))}</span>
                          </div>
                        )}
                        {creditCardPayments.length > 0 && (
                          <div className="flex items-center justify-between text-blue-400">
                            <span>💳 Payments:</span>
                            <span>{creditCardPayments.length} due</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`space-y-2 ${isTouchDevice ? 'max-h-32 overflow-y-auto' : ''}`}>
                      {/* Recurring Expenses */}
                      {expensesForDay.map((expense, idx) => (
                        <div key={`exp-${idx}`} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{expense.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400">
                                {formatAmount(expense.amount)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete "${expense.name}"?`)) {
                                    deleteExpense(expense.id);
                                  }
                                }}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-slate-700 rounded"
                                title="Delete expense"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-slate-500">{expense.category}</div>
                        </div>
                      ))}

                      {/* Credit Card Payments */}
                      {creditCardPayments.map((card, idx) => (
                        <div key={`crd-${idx}`} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{card.name}</span>
                            <span className="text-blue-400">Due</span>
                          </div>
                          <div className="text-slate-500">Credit Card Payment</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards - Better mobile stacking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-4 md:p-6 lg:p-8 backdrop-blur-sm rounded-lg">
          <div className="border-l-2 border-red-600 pl-3 sm:pl-4 md:pl-6">
            <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
              Monthly Recurring Expenses
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-slate-100 mb-2">
              {formatAmount(
                recurringExpenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
            <div className="text-slate-500 text-sm">
              {recurringExpenses.length} recurring expense{recurringExpenses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-4 md:p-6 lg:p-8 backdrop-blur-sm rounded-lg">
          <div className="border-l-2 border-blue-600 pl-3 sm:pl-4 md:pl-6">
            <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
              Credit Card Payments
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-slate-100 mb-2">
              {creditCards.length}
            </div>
            <div className="text-slate-500 text-sm">
              Credit card{creditCards.length !== 1 ? 's' : ''} with payments due
            </div>
          </div>
        </div>
      </div>

      {/* Quote - More compact on mobile */}
      <div className="text-center pt-6 sm:pt-8 md:pt-12 border-t border-slate-800 px-2 sm:px-4">
        <p className="text-slate-500 text-xs sm:text-sm font-serif italic max-w-2xl mx-auto">
          &quot;Plan your finances with precision and foresight.&quot;
        </p>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AuthGate>
      <CalendarPageContent />
    </AuthGate>
  );
}
