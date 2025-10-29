'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { transactionsService } from '@/lib/firebase/firestore';
import { Transaction } from '@/types';

export default function CalendarPage() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadRecurringTransactions();
  }, [user]);

  const loadRecurringTransactions = async () => {
    try {
      setLoading(true);
      const allTransactions = await transactionsService.getByUserId(user!.uid);
      // Filter only recurring transactions
      const recurring = allTransactions.filter(t => t.isRecurring);
      setRecurringTransactions(recurring);
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
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

  const getRecurringPaymentsForDay = (day: number) => {
    return recurringTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getDate() === day;
    });
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
            {recurringTransactions.length} Recurring Payment{recurringTransactions.length !== 1 ? 's' : ''}
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
            const paymentsForDay = getRecurringPaymentsForDay(day);
            const isToday = isCurrentMonth && day === currentDay;

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

                {paymentsForDay.length > 0 && (
                  <div className="space-y-1">
                    {paymentsForDay.slice(0, 2).map((payment, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 border-l-2 ${
                          payment.type === 'expense' 
                            ? 'border-red-500 bg-red-900/20 text-red-300' 
                            : 'border-green-500 bg-green-900/20 text-green-300'
                        } truncate`}
                        title={`${payment.description} - ${formatAmount(payment.amount)}`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">{payment.description}</span>
                        </div>
                      </div>
                    ))}
                    {paymentsForDay.length > 2 && (
                      <div className="text-xs text-slate-500 text-center">
                        +{paymentsForDay.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Hover tooltip */}
                {paymentsForDay.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 p-4 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                    <div className="text-xs text-amber-400 mb-2 font-serif tracking-wider">
                      {monthNames[month]} {day}, {year}
                    </div>
                    <div className="space-y-2">
                      {paymentsForDay.map((payment, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{payment.description}</span>
                            <span className={payment.type === 'expense' ? 'text-red-400' : 'text-green-400'}>
                              {formatAmount(payment.amount)}
                            </span>
                          </div>
                          <div className="text-slate-500">{payment.category}</div>
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
                recurringTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <div className="text-slate-500 text-sm">
              {recurringTransactions.filter(t => t.type === 'expense').length} payment{recurringTransactions.filter(t => t.type === 'expense').length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm">
          <div className="border-l-2 border-green-600 pl-6">
            <div className="text-slate-500 text-xs tracking-widest uppercase mb-2 font-serif">
              Monthly Recurring Income
            </div>
            <div className="text-4xl font-serif text-slate-100 mb-2">
              {formatAmount(
                recurringTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <div className="text-slate-500 text-sm">
              {recurringTransactions.filter(t => t.type === 'income').length} payment{recurringTransactions.filter(t => t.type === 'income').length !== 1 ? 's' : ''}
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
