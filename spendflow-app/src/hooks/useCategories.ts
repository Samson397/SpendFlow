import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types';
import { categoriesService } from '@/lib/firebase/firestore';
import { where } from 'firebase/firestore';

export function useCategories(userId: string | undefined, type?: 'income' | 'expense', options?: {
  realtime?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      let data: Category[];
      if (type) {
        data = await categoriesService.getByType(type);
      } else {
        data = await categoriesService.getAll();
      }

      // Filter by user if needed (global categories might be shared)
      const userCategories = data; // Categories are global
      setCategories(userCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (!userId) return;

    if (options?.realtime !== false) {
      // Real-time subscription
      const constraints = type ? [where('type', '==', type)] : [];
      const unsubscribe = categoriesService.subscribe(
        (data: Category[]) => {
          // Filter by user if needed
          const userCategories = data; // Categories are global
          setCategories(userCategories);
          setLoading(false);
          setError(null);
        },
        ...constraints
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      fetchCategories();
    }

    return undefined;
  }, [userId, type, options?.realtime, fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh
  };
}
