import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { transactionsService } from '@/lib/firebase/firestore';
import { where, orderBy, limit } from 'firebase/firestore';

export function useTransactions(userId: string | undefined, options?: {
  limit?: number;
  realtime?: boolean;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const limitCount = options?.limit || 50;
      const data = await transactionsService.getRecentByUserId(userId, limitCount);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [userId, options?.limit]);

  useEffect(() => {
    if (!userId) return;

    if (options?.realtime !== false) {
      // Real-time subscription
      const unsubscribe = transactionsService.subscribe(
        (data: Transaction[]) => {
          setTransactions(data);
          setLoading(false);
          setError(null);
        },
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(options?.limit || 50)
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      fetchTransactions();
    }
  }, [userId, options?.realtime, options?.limit, fetchTransactions]);

  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh
  };
}
