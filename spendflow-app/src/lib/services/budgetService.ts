import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Budget, BudgetAlert, BudgetTemplate } from '@/types/budget';

export class BudgetService {
  // Budget CRUD operations
  static async create(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const budgetData = {
        ...budget,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'budgets'), budgetData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  static async update(budgetId: string, updates: Partial<Budget>): Promise<void> {
    try {
      await updateDoc(doc(db, 'budgets', budgetId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  static async delete(budgetId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'budgets', budgetId));
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  static async getByUserId(userId: string): Promise<Budget[]> {
    try {
      const q = query(collection(db, 'budgets'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Budget[];
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  static subscribeToBudgets(userId: string, callback: (budgets: Budget[]) => void) {
    const q = query(collection(db, 'budgets'), where('userId', '==', userId));

    return onSnapshot(q, (querySnapshot) => {
      const budgets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Budget[];

      callback(budgets);
    });
  }

  // Budget calculation helpers
  static async updateBudgetSpending(budgetId: string, spent: number): Promise<void> {
    try {
      await this.update(budgetId, { spent });
    } catch (error) {
      console.error('Error updating budget spending:', error);
      throw error;
    }
  }

  static async recalculateBudgetSpending(budget: Budget, transactions: any[]): Promise<void> {
    try {
      const now = new Date();
      const periodStart = this.getPeriodStart(budget.period, now);

      const relevantTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        t.category === budget.category &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) <= now
      );

      const totalSpent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

      await this.updateBudgetSpending(budget.id, totalSpent);
    } catch (error) {
      console.error('Error recalculating budget spending:', error);
      throw error;
    }
  }

  static getPeriodStart(period: 'weekly' | 'monthly' | 'yearly', currentDate: Date): Date {
    const date = new Date(currentDate);

    switch (period) {
      case 'weekly':
        // Start of week (Sunday)
        const dayOfWeek = date.getDay();
        date.setDate(date.getDate() - dayOfWeek);
        break;
      case 'monthly':
        // Start of month
        date.setDate(1);
        break;
      case 'yearly':
        // Start of year
        date.setMonth(0, 1);
        break;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  static getBudgetStatus(budget: Budget): {
    percentage: number;
    status: 'safe' | 'warning' | 'danger' | 'exceeded';
    remaining: number;
    daysLeft: number;
  } {
    const percentage = (budget.spent / budget.amount) * 100;
    const remaining = budget.amount - budget.spent;
    const daysLeft = Math.ceil((budget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    let status: 'safe' | 'warning' | 'danger' | 'exceeded';

    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'danger';
    } else if (percentage >= budget.alertThreshold) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return { percentage, status, remaining, daysLeft };
  }

  // Budget templates
  static getBudgetTemplates(): BudgetTemplate[] {
    return [
      {
        id: 'minimalist',
        name: 'Minimalist Lifestyle',
        description: 'Focused on essentials with minimal discretionary spending',
        categories: [
          { name: 'Housing', percentage: 30, description: 'Rent/mortgage and utilities' },
          { name: 'Food', percentage: 15, description: 'Groceries and dining' },
          { name: 'Transportation', percentage: 10, description: 'Gas, public transit, car maintenance' },
          { name: 'Insurance', percentage: 8, description: 'Health, auto, home insurance' },
          { name: 'Utilities', percentage: 5, description: 'Electricity, water, internet' },
          { name: 'Savings', percentage: 20, description: 'Emergency fund and retirement' },
          { name: 'Entertainment', percentage: 5, description: 'Movies, hobbies, subscriptions' },
          { name: 'Miscellaneous', percentage: 7, description: 'Personal care, clothing, etc.' },
        ],
      },
      {
        id: 'balanced',
        name: 'Balanced Living',
        description: 'Comfortable lifestyle with room for enjoyment',
        categories: [
          { name: 'Housing', percentage: 28, description: 'Rent/mortgage and utilities' },
          { name: 'Food', percentage: 12, description: 'Groceries and dining' },
          { name: 'Transportation', percentage: 12, description: 'Gas, public transit, car maintenance' },
          { name: 'Insurance', percentage: 6, description: 'Health, auto, home insurance' },
          { name: 'Utilities', percentage: 4, description: 'Electricity, water, internet' },
          { name: 'Savings', percentage: 15, description: 'Emergency fund and retirement' },
          { name: 'Entertainment', percentage: 8, description: 'Movies, hobbies, subscriptions' },
          { name: 'Shopping', percentage: 6, description: 'Clothing, electronics, etc.' },
          { name: 'Miscellaneous', percentage: 9, description: 'Personal care, travel, etc.' },
        ],
      },
      {
        id: 'luxury',
        name: 'Luxury Lifestyle',
        description: 'Premium lifestyle with higher discretionary spending',
        categories: [
          { name: 'Housing', percentage: 25, description: 'Rent/mortgage and utilities' },
          { name: 'Food', percentage: 10, description: 'Groceries and dining' },
          { name: 'Transportation', percentage: 15, description: 'Gas, public transit, car maintenance' },
          { name: 'Insurance', percentage: 5, description: 'Health, auto, home insurance' },
          { name: 'Utilities', percentage: 3, description: 'Electricity, water, internet' },
          { name: 'Savings', percentage: 10, description: 'Emergency fund and retirement' },
          { name: 'Entertainment', percentage: 12, description: 'Movies, hobbies, subscriptions' },
          { name: 'Shopping', percentage: 10, description: 'Clothing, electronics, luxury items' },
          { name: 'Travel', percentage: 5, description: 'Vacations and trips' },
          { name: 'Miscellaneous', percentage: 5, description: 'Personal care, memberships, etc.' },
        ],
      },
    ];
  }

  static createBudgetFromTemplate(template: BudgetTemplate, totalIncome: number): Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'spent'>[] {
    return template.categories.map(category => ({
      name: `${category.name} Budget`,
      category: category.name,
      amount: (totalIncome * category.percentage) / 100,
      period: 'monthly' as const,
      startDate: new Date(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // End of current month
      isActive: true,
      alertsEnabled: true,
      alertThreshold: 75,
    }));
  }
}
