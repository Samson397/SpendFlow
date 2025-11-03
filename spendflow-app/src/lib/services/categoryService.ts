import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Category } from '@/types';

class CategoryService {
  private static instance: CategoryService;
  private categoriesRef = collection(db, 'categories');

  private constructor() {}

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Get all categories for a user
   */
  async getUserCategories(userId: string): Promise<Category[]> {
    try {
      const q = query(
        this.categoriesRef,
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const categories: Category[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name,
          color: data.color,
          icon: data.icon,
          type: data.type,
        });
      });

      return categories;
    } catch (error) {
      console.error('Error getting user categories:', error);
      return [];
    }
  }

  /**
   * Create a new category
   */
  async createCategory(userId: string, categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.categoriesRef, {
        ...categoryData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId: string, updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>>): Promise<void> {
    try {
      const docRef = doc(this.categoriesRef, categoryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = doc(this.categoriesRef, categoryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Get default categories
   */
  getDefaultCategories(type: 'income' | 'expense'): Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] {
    const defaults = {
      income: [
        { name: 'Salary', color: '#10b981', icon: '💼', type: 'income' as const },
        { name: 'Freelance', color: '#3b82f6', icon: '💻', type: 'income' as const },
        { name: 'Investment', color: '#8b5cf6', icon: '📈', type: 'income' as const },
        { name: 'Gift', color: '#f59e0b', icon: '🎁', type: 'income' as const },
        { name: 'Other', color: '#6b7280', icon: '💰', type: 'income' as const },
      ],
      expense: [
        { name: 'Food', color: '#ef4444', icon: '🍽️', type: 'expense' as const },
        { name: 'Transport', color: '#f97316', icon: '🚗', type: 'expense' as const },
        { name: 'Shopping', color: '#ec4899', icon: '🛍️', type: 'expense' as const },
        { name: 'Bills', color: '#6366f1', icon: '📄', type: 'expense' as const },
        { name: 'Entertainment', color: '#8b5cf6', icon: '🎬', type: 'expense' as const },
        { name: 'Healthcare', color: '#06b6d4', icon: '🏥', type: 'expense' as const },
        { name: 'Other', color: '#6b7280', icon: '📦', type: 'expense' as const },
      ],
    };

    return defaults[type] || [];
  }

  /**
   * Get all categories (default + user custom)
   */
  async getAllCategories(userId: string, type?: 'income' | 'expense'): Promise<Category[]> {
    const userCategories = await this.getUserCategories(userId);
    const defaultCategories = this.getDefaultCategories(type || 'expense');

    // Filter user categories by type if specified
    const filteredUserCategories = type
      ? userCategories.filter(cat => cat.type === type)
      : userCategories;

    // Combine and return unique categories (user categories override defaults with same name)
    const combinedCategories: Category[] = defaultCategories.map(defaultCat => ({
      id: '', // Default categories don't have IDs
      ...defaultCat,
    }));

    filteredUserCategories.forEach(userCat => {
      const existingIndex = combinedCategories.findIndex(cat => cat.name === userCat.name && cat.type === userCat.type);
      if (existingIndex >= 0) {
        combinedCategories[existingIndex] = userCat;
      } else {
        combinedCategories.push(userCat);
      }
    });

    return combinedCategories;
  }
}

export const categoryService = CategoryService.getInstance();
