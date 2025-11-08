import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recurringExpensePaymentService } from '@/lib/services/recurringExpensePayments';
import { creditCardPaymentService } from '@/lib/services/creditCardPayments';
import { notificationService } from '@/lib/services/notificationService';

/**
 * Hook to automatically process recurring expenses when user logs in
 * Checks once per day per user session
 */
export function useRecurringExpenseProcessor() {
  const { user } = useAuth();
  const hasProcessedToday = useRef(false);
  const lastProcessedDate = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      hasProcessedToday.current = false;
      lastProcessedDate.current = null;
      return;
    }

    const processRecurringExpenses = async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if we've already processed today
      const storedDate = localStorage.getItem(`lastRecurringProcess_${user.uid}`);
      
      if (storedDate === today || hasProcessedToday.current) {
        console.log('✅ Recurring expenses already processed today');
        return;
      }

      try {
        console.log('🔄 Processing recurring expenses and credit card payments...');
        
        // Process recurring expenses
        await recurringExpensePaymentService.processDueExpenses(user.uid, user.email);
        console.log('✅ Recurring expenses processed');
        
        // Process credit card payments
        await creditCardPaymentService.processDuePayments(user.uid);
        console.log('✅ Credit card payments processed');

        // Check for upcoming insufficient funds warnings
        await notificationService.checkUpcomingInsufficientFunds(user.uid);
        console.log('✅ Insufficient funds check completed');

        // Mark as processed
        hasProcessedToday.current = true;
        lastProcessedDate.current = today;
        localStorage.setItem(`lastRecurringProcess_${user.uid}`, today);
        
        console.log('✅ All automatic payments processed successfully');
      } catch (error) {
        console.error('❌ Error processing automatic payments:', error);
      }
    };

    // Process after a short delay to ensure user is fully authenticated
    const timer = setTimeout(() => {
      processRecurringExpenses();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);
}
