import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { Transaction } from '@/types';
import { accessControlService } from './accessControlService';

export const transactionsService = {
  // Create a new transaction
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    // Check subscription limits before creating transaction
    const canAddTransaction = await accessControlService.canAddTransaction(transactionData.userId);

    if (!canAddTransaction.allowed) {
      throw new Error(canAddTransaction.reason || 'Transaction limit exceeded. Please upgrade your plan.');
    }

    const transactionRef = doc(collection(db, 'transactions'));
    const now = new Date();
    const newTransaction: Transaction = {
      ...transactionData,
      id: transactionRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(transactionRef, newTransaction);
    return newTransaction;
  },
  
  // Get a single transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data().date?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Transaction;
  },
  
  // Get all transactions for a user
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transaction));
  },
  
  // Get recent transactions for a user
  async getRecentTransactions(userId: string, limitCount: number = 10): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transaction));
  },
  
  // Get transactions by date range
  async getTransactionsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transaction));
  },
  
  // Get transactions by card
  async getTransactionsByCard(userId: string, cardId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('cardId', '==', cardId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transaction));
  },
  
  // Get transactions by savings account
  async getTransactionsBySavingsAccount(userId: string, savingsAccountId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('savingsAccountId', '==', savingsAccountId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transaction));
  },
  
  // Update a transaction
  async updateTransaction(
    transactionId: string, 
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },
  
  // Delete a transaction
  async deleteTransaction(transactionId: string): Promise<void> {
    const transactionRef = doc(db, 'transactions', transactionId);
    await deleteDoc(transactionRef);
  },
  
  // Get total amount by transaction type and date range
  async getTotalByType(
    userId: string, 
    type: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    const transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  },
};

export default transactionsService;
