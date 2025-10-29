'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CreditCard } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { RecurringExpense } from '@/types/recurring';
import { Card } from '@/types';

export default function CalendarPage() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [creditCards, setCreditCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-100 mb-4 tracking-wide">
          C A L E N D A R
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Recurring Payments Schedule</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={previousMonth}
          className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 hover:border-amber-600/50 hover:text-amber-400 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-serif tracking-wider">Previous</span>
        </button>
        
        <div className="text-center">
          <div className="text-3xl font-serif text-slate-100 tracking-wide">
            {monthNames[month]} {year}
          </div>
          <div className="text-slate-500 text-sm tracking-wider mt-2">
            {recurringExpenses.length} Recurring Expense{recurringExpenses.length !== 1 ? 's' : ''} • {creditCards.length} Credit Card{creditCards.length !== 1 ? 's' : ''}
          </div>
        </div>

        <button
          onClick={nextMonth}
          className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 hover:border-amber-600/50 hover:text-amber-400 transition-all"
        >
          <span className="font-serif tracking-wider">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-8">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center">
              <div className="text-amber-400 text-xs tracking-widest uppercase font-serif py-2">
                {day}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-4">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const expensesForDay = getRecurringExpensesForDay(day);
            const creditCardPayments = getCreditCardPaymentsForDay(day);
            const isToday = isCurrentMonth && day === currentDay;
            const hasItems = expensesForDay.length > 0 || creditCardPayments.length > 0;

            return (
              <div
                key={day}
                className={`aspect-square border ${
                  isToday 
                    ? 'border-amber-600 bg-amber-900/20' 
                    : 'border-slate-800 bg-slate-900/30'
                } p-2 hover:border-amber-600/50 transition-all relative group`}
              >
                <div className={`text-sm font-serif ${
                  isToday ? 'text-amber-400' : 'text-slate-300'
                } mb-1`}>
                  {day}
                </div>

                {hasItems && (
                  <div className="space-y-1">
                    {/* Recurring Expenses */}
                    {expensesForDay.slice(0, 1).map((expense, idx) => (
                      <div
                        key={`expense-${idx}`}
                        className="text-xs px-2 py-1 border-l-2 border-red-500 bg-red-900/20 text-red-300 truncate"
                        title={`${expense.name} - ${formatAmount(expense.amount)}`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{expense.name}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Credit Card Payments */}
                    {creditCardPayments.slice(0, 1).map((card, idx) => (
                      <div
                        key={`card-${idx}`}
                        className="text-xs px-2 py-1 border-l-2 border-blue-500 bg-blue-900/20 text-blue-300 truncate"
                        title={`${card.name} Payment Due`}
                      >
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span className="truncate">{card.name} Payment</span>
                        </div>
                      </div>
                    ))}
                    
                    {(expensesForDay.length + creditCardPayments.length) > 2 && (
                      <div className="text-xs text-slate-500 text-center">
                        +{(expensesForDay.length + creditCardPayments.length) - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Hover tooltip */}
                {hasItems && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 p-4 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                    <div className="text-xs text-amber-400 mb-2 font-serif tracking-wider">
                      {monthNames[month]} {day}, {year}
                    </div>
                    <div className="space-y-2">
                      {/* Recurring Expenses */}
                      {expensesForDay.map((expense, idx) => (
                        <div key={`exp-${idx}`} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{expense.name}</span>
                            <span className="text-red-400">
                              {formatAmount(expense.amount)}
                            </span>
                          </div>
                          <div className="text-slate-500">{expense.category}</div>
                        </div>
                      ))}
                      
                      {/* Credit Card Payments */}
                      {creditCardPayments.map((card, idx) => (
                        <div key={`crd-${idx}`} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{card.name} Payment</span>
                            <span className="text-blue-400">
                              Due
                            </span>
                          </div>
                          <div className="text-slate-500">Credit Card Bill</div>
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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-red-600 pl-6">
            <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
              Monthly Recurring Expenses
            </div>
            <div className="text-4xl font-serif text-slate-100 mb-2">
              {formatAmount(
                recurringExpenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </div>
            <div className="text-slate-500 text-sm">
              {recurringExpenses.length} recurring expense{recurringExpenses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-blue-600 pl-6">
            <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
              Credit Card Payments
            </div>
            <div className="text-4xl font-serif text-slate-100 mb-2">
              {creditCards.length}
            </div>
            <div className="text-slate-500 text-sm">
              Credit card{creditCards.length !== 1 ? 's' : ''} with payment due
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="text-center pt-12 border-t border-slate-800">
        <p className="text-slate-500 text-sm font-serif italic">
          &quot;Plan your finances with precision and foresight.&quot;
        </p>
      </div>
    </div>
  );
}
