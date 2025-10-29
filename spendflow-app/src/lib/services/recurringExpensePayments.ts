import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { RecurringExpense } from '@/types/recurring';
import { Card } from '@/types';

export const recurringExpensePaymentService = {
  /**
   * Process recurring expenses that are due today
   * This should be run daily (via cron job or manual trigger)
   */
  async processDueExpenses(userId: string): Promise<void> {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

    // Get all active recurring expenses for user
    const expensesQuery = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const expensesSnapshot = await getDocs(expensesQuery);
    const recurringExpenses = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecurringExpense));

    // Filter expenses due today that haven't been processed this month
    const expensesDueToday = recurringExpenses.filter(expense => {
      const lastProcessed = expense.lastProcessed || '';
      const lastProcessedMonth = lastProcessed.slice(0, 7);
      
      return expense.dayOfMonth === currentDay && lastProcessedMonth !== currentMonth;
    });

    // Process each expense
    for (const expense of expensesDueToday) {
      await this.processExpense(expense);
    }
  },

  /**
   * Process a single recurring expense
   */
  async processExpense(expense: RecurringExpense): Promise<void> {
    try {
      // Get the payment card
      const cardDoc = await getDocs(
        query(collection(db, 'cards'), where('__name__', '==', expense.cardId))
      );

      if (cardDoc.empty) {
        throw new Error('Payment card not found');
      }

      const card = { id: cardDoc.docs[0].id, ...cardDoc.docs[0].data() } as Card;

      // Check if card has sufficient balance (for debit) or available credit (for credit)
      if (card.type === 'debit' && card.balance < expense.amount) {
        throw new Error('Insufficient funds in card');
      }

      if (card.type === 'credit') {
        const availableCredit = (card.creditLimit || card.limit || 0) - card.balance;
        if (availableCredit < expense.amount) {
          throw new Error('Insufficient credit available');
        }
      }

      // Update card balance
      const newBalance = card.type === 'debit' 
        ? card.balance - expense.amount  // Debit: decrease balance
        : card.balance + expense.amount; // Credit: increase balance (owed)

      await updateDoc(doc(db, 'cards', card.id), {
        balance: newBalance,
        updatedAt: new Date(),
      });

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: expense.userId,
        cardId: card.id,
        amount: expense.amount,
        type: 'expense',
        category: expense.category,
        description: `${expense.name} (Auto-Pay)`,
        date: new Date().toISOString(),
        isRecurring: true,
        recurringExpenseId: expense.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update recurring expense - mark as processed
      await updateDoc(doc(db, 'recurringExpenses', expense.id), {
        lastProcessed: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Recurring expense processed: ${expense.name} - $${expense.amount}`);
    } catch (error) {
      console.error(`Error processing recurring expense ${expense.name}:`, error);
      
      // Log failed processing attempt
      await addDoc(collection(db, 'recurringExpenseErrors'), {
        recurringExpenseId: expense.id,
        expenseName: expense.name,
        amount: expense.amount,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptDate: new Date().toISOString(),
      });
    }
  },

  /**
   * Get upcoming recurring expenses for a user
   */
  async getUpcomingExpenses(userId: string, days: number = 30): Promise<Array<RecurringExpense & { daysUntil: number }>> {
    const expensesQuery = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecurringExpense));

    const today = new Date();
    const currentDay = today.getDate();

    // Calculate days until next occurrence
    const upcomingExpenses = expenses.map(expense => {
      let daysUntil: number;
      
      if (expense.dayOfMonth >= currentDay) {
        // This month
        daysUntil = expense.dayOfMonth - currentDay;
      } else {
        // Next month
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, expense.dayOfMonth);
        const diffTime = nextMonth.getTime() - today.getTime();
        daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...expense,
        daysUntil,
      };
    });

    // Filter to only show expenses within the specified days
    return upcomingExpenses
      .filter(e => e.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  },

  /**
   * Get total monthly recurring expenses for a user
   */
  async getMonthlyTotal(userId: string): Promise<number> {
    const expensesQuery = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses = snapshot.docs.map(doc => doc.data() as RecurringExpense);

    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },

  /**
   * Get recurring expenses by category
   */
  async getExpensesByCategory(userId: string): Promise<Record<string, number>> {
    const expensesQuery = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses = snapshot.docs.map(doc => doc.data() as RecurringExpense);

    const byCategory: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0;
      }
      byCategory[expense.category] += expense.amount;
    });

    return byCategory;
  },

  /**
   * Preview what would be charged today (for testing)
   */
  async previewTodaysCharges(userId: string): Promise<RecurringExpense[]> {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7);

    const expensesQuery = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecurringExpense));

    return expenses.filter(expense => {
      const lastProcessed = expense.lastProcessed || '';
      const lastProcessedMonth = lastProcessed.slice(0, 7);
      
      return expense.dayOfMonth === currentDay && lastProcessedMonth !== currentMonth;
    });
  },
};
