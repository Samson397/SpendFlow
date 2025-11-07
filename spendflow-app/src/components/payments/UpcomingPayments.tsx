'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { RecurringPaymentService } from '@/lib/services/recurringPaymentService';
import { Card } from '@/types';
import toast from 'react-hot-toast';

interface UpcomingPayment {
  creditCard: Card;
  debitCard: Card;
  amount: number;
  dueDate: Date;
}

export function UpcomingPayments() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [payments, setPayments] = useState<UpcomingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUpcomingPayments();
    }
  }, [user]);

  const loadUpcomingPayments = async () => {
    if (!user) return;

    try {
      const upcomingPayments = await RecurringPaymentService.getUpcomingPayments(user.uid);
      setPayments(upcomingPayments);
    } catch (error) {
      console.error('Error loading upcoming payments:', error);
      toast.error('Failed to load upcoming payments');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (creditCardId: string) => {
    if (!user) return;

    setProcessing(creditCardId);
    try {
      const result = await RecurringPaymentService.processPaymentForCard(creditCardId);

      if (result.success) {
        toast.success(`Payment processed: ${formatAmount(result.amount)}`);
        await loadUpcomingPayments(); // Refresh the list
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
          <span className="ml-3 text-slate-400">Loading upcoming payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-serif text-slate-100 tracking-wide">Upcoming Payments</h3>
          <p className="text-slate-400 text-sm">Credit card payments due this month</p>
        </div>
        <button
          onClick={loadUpcomingPayments}
          className="text-xs text-amber-400 hover:text-amber-300 underline"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-600 mb-2">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No upcoming payments</p>
          <p className="text-slate-500 text-xs mt-1">All credit cards are paid up or auto-pay is disabled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.creditCard.id} className="border border-slate-800 bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-slate-200 font-medium">{payment.creditCard.name}</div>
                    <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      Due: {formatDate(payment.dueDate)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    Pay from: {payment.debitCard.name} (****{payment.debitCard.lastFour})
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-serif text-slate-100">{formatAmount(payment.amount)}</div>
                    <div className="text-xs text-slate-500">Minimum payment</div>
                  </div>
                  <button
                    onClick={() => handleProcessPayment(payment.creditCard.id)}
                    disabled={processing === payment.creditCard.id}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {processing === payment.creditCard.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
