import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/types';
import { cardsService } from '@/lib/firebase/firestore';
import { where, orderBy } from 'firebase/firestore';

export function useCards(userId: string | undefined, options?: {
  realtime?: boolean;
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await cardsService.getByUserId(userId);
      setCards(data);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    if (options?.realtime !== false) {
      // Real-time subscription
      const unsubscribe = cardsService.subscribe(
        (data: Card[]) => {
          setCards(data);
          setLoading(false);
          setError(null);
        },
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      fetchCards();
    }

    return undefined;
  }, [userId, options?.realtime, fetchCards]);

  const refresh = useCallback(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    refresh
  };
}
