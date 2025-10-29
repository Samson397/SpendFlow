import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { RecurringExpense } from '@/types/recurring';

const COLLECTION_NAME = 'recurringExpenses';

export const recurringExpensesService = {
  // Create new recurring expense
  async create(data: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Get all recurring expenses for a user
  async getByUserId(userId: string): Promise<RecurringExpense[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('dayOfMonth', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecurringExpense));
  },

  // Get recurring expenses due for processing
  async getDueExpenses(userId: string): Promise<RecurringExpense[]> {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const allExpenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RecurringExpense));
    
    // Filter for expenses due today that haven't been processed this month
    return allExpenses.filter(expense => {
      const lastProcessed = expense.lastProcessed || '';
      const lastProcessedMonth = lastProcessed.slice(0, 7);
      
      return expense.dayOfMonth === currentDay && lastProcessedMonth !== currentMonth;
    });
  },

  // Update recurring expense
  async update(id: string, data: Partial<RecurringExpense>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  // Mark as processed
  async markProcessed(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      lastProcessed: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  // Delete (soft delete by setting isActive to false)
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  },

  // Hard delete
  async hardDelete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
