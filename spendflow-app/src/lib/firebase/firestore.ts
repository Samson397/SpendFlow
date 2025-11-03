import { db } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  DocumentSnapshot,
  addDoc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  onSnapshot,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { UserProfile, Card, Transaction, Expense, Income, Category } from '@/types';

// Helper to convert Firestore timestamps to JS Dates
const convertTimestamps = <T>(data: T): T => {
  if (!data) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate() as unknown as T;
  }
  
  if (Array.isArray(data)) {
    return data.map(convertTimestamps) as unknown as T;
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data as Record<string, unknown>).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: convertTimestamps(value)
    }), {} as Record<string, unknown>) as T;
  }
  
  return data;
};

// Base service class for common Firestore operations
class FirestoreService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  // Convert Firestore document to typed object
  protected toObject(doc: DocumentSnapshot<DocumentData>): T | null {
    if (!doc.exists()) return null;
    return { id: doc.id, ...convertTimestamps(doc.data()) } as T;
  }

  // Convert typed object to Firestore document data
  protected toFirestore(data: Partial<T>): DocumentData {
    const { id, ...rest } = data as { id?: string; [key: string]: unknown };
    return rest as DocumentData;
  }

  // Get a document by ID
  async get(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return this.toObject(docSnap);
  }

  // Get all documents
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => this.toObject(doc) as T);
  }

  // Get documents by user ID
  async getByUserId(userId: string): Promise<T[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.toObject(doc) as T);
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: now,
      updatedAt: now
    });
    return { ...data, id: docRef.id, createdAt: now, updatedAt: now } as unknown as T;
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Real-time subscription to collection
  subscribe(
    callback: (data: T[]) => void,
    ...queryConstraints: QueryConstraint[]
  ): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      ...queryConstraints
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => this.toObject(doc))
        .filter((item): item is T => item !== null);
      callback(data);
    });
  }

  // Real-time subscription to single document
  subscribeToDoc(id: string, callback: (data: T | null) => void): Unsubscribe {
    const docRef = doc(db, this.collectionName, id);
    return onSnapshot(docRef, (doc) => {
      callback(this.toObject(doc));
    });
  }
}

// User profiles service
const usersServiceBase = new FirestoreService<UserProfile>('users');
export const usersService = {
  get: (id: string) => usersServiceBase.get(id),
  getAll: () => usersServiceBase.getAll(),
  create: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => usersServiceBase.create(data),
  update: (id: string, data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => usersServiceBase.update(id, data),
  delete: (id: string) => usersServiceBase.delete(id),
  
  async getByEmail(email: string): Promise<(UserProfile & { id: string }) | null> {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile & { id: string };
  },

  async makeAdmin(uid: string): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { isAdmin: true });
  },

  async updateTier(uid: string, tier: 'free' | 'pro' | 'enterprise'): Promise<void> {
    const docRef = doc(db, 'users', uid);
    const now = new Date();
    
    // Define features based on tier
    const features = {
      free: {
        maxCards: 2,
        maxTransactions: 100,
        analytics: false,
        export: false,
        prioritySupport: false
      },
      pro: {
        maxCards: 10,
        maxTransactions: 1000,
        analytics: true,
        export: true,
        prioritySupport: false
      },
      enterprise: {
        maxCards: 50,
        maxTransactions: 10000,
        analytics: true,
        export: true,
        prioritySupport: true
      }
    };

    await updateDoc(docRef, {
      'subscription.tier': tier,
      'subscription.status': 'active',
      'subscription.updatedAt': now,
      'features': features[tier],
      updatedAt: now
    });
  }
};

// Cards service
const cardsServiceBase = new FirestoreService<Card>('cards');
export const cardsService = {
  get: (id: string) => cardsServiceBase.get(id),
  getAll: () => cardsServiceBase.getAll(),
  create: (data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => cardsServiceBase.create(data),
  update: (id: string, data: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>) => cardsServiceBase.update(id, data),
  delete: (id: string) => cardsServiceBase.delete(id),
  
  async getByUserId(userId: string): Promise<Card[]> {
    const q = query(
      collection(db, 'cards'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Card));
  },

  async updateBalance(cardId: string, amount: number): Promise<void> {
    const docRef = doc(db, 'cards', cardId);
    await updateDoc(docRef, {
      balance: amount,
      updatedAt: new Date()
    });
  }
};

// Transactions service
const transactionsServiceBase = new FirestoreService<Transaction>('transactions');
export const transactionsService = {
  get: (id: string) => transactionsServiceBase.get(id),
  getAll: () => transactionsServiceBase.getAll(),
  create: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => transactionsServiceBase.create(data),
  update: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => transactionsServiceBase.update(id, data),
  delete: (id: string) => transactionsServiceBase.delete(id),
  
  async getByUserId(userId: string): Promise<Transaction[]> {
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
      updatedAt: doc.data().updatedAt?.toDate()
    } as Transaction));
  },

  async getRecentByUserId(userId: string, limitCount: number = 10): Promise<Transaction[]> {
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
      updatedAt: doc.data().updatedAt?.toDate()
    } as Transaction));
  },

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
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
      updatedAt: doc.data().updatedAt?.toDate()
    } as Transaction));
  },

  async getTotalByType(userId: string, type: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await this.getByDateRange(userId, startDate, endDate);
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }
};

// Expenses service
const expensesServiceBase = new FirestoreService<Expense>('expenses');
export const expensesService = {
  get: (id: string) => expensesServiceBase.get(id),
  getAll: () => expensesServiceBase.getAll(),
  create: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => expensesServiceBase.create(data),
  update: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) => expensesServiceBase.update(id, data),
  delete: (id: string) => expensesServiceBase.delete(id),
  
  async getActiveByUserId(userId: string): Promise<Expense[]> {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('paymentDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Expense));
  },

  async getByCategory(userId: string, startDate: Date, endDate: Date): Promise<{category: string; amount: number}[]> {
    const transactions = await transactionsService.getByDateRange(userId, startDate, endDate);
    
    return Object.entries(
      transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => ({
          ...acc,
          [t.category]: (acc[t.category] || 0) + t.amount
        }), {} as Record<string, number>)
    ).map(([category, amount]) => ({ category, amount }));
  }
};

// Income service
const incomeServiceBase = new FirestoreService<Income>('income');
export const incomeService = {
  get: (id: string) => incomeServiceBase.get(id),
  getAll: () => incomeServiceBase.getAll(),
  create: (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => incomeServiceBase.create(data),
  update: (id: string, data: Partial<Omit<Income, 'id' | 'createdAt' | 'updatedAt'>>) => incomeServiceBase.update(id, data),
  delete: (id: string) => incomeServiceBase.delete(id),
  
  async getByUserId(userId: string): Promise<Income[]> {
    const q = query(
      collection(db, 'income'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Income));
  },

  async getTotalByPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const incomes = await this.getByUserId(userId);
    return incomes
      .filter(income => income.date >= startDate && income.date <= endDate)
      .reduce((sum, income) => sum + income.amount, 0);
  }
};

// Categories service
export const categoriesService = {
  ...new FirestoreService<Category>('categories'),
  
  async getByType(type: 'expense' | 'income'): Promise<(Category & { id: string })[]> {
    const q = query(
      collection(db, 'categories'),
      where('type', '==', type)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category & { id: string }));
  },
  
  async getAll(): Promise<(Category & { id: string })[]> {
    const q = query(collection(db, 'categories'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category & { id: string }));
  },
  
  // Initialize default categories if they don't exist
  async initDefaultCategories() {
    const defaultCategories: Omit<Category, 'id'>[] = [
      // Expense categories
      { name: 'Housing', color: '#3B82F6', icon: '🏠', type: 'expense' },
      { name: 'Food', color: '#10B981', icon: '🍔', type: 'expense' },
      { name: 'Transportation', color: '#F59E0B', icon: '🚗', type: 'expense' },
      { name: 'Utilities', color: '#8B5CF6', icon: '💡', type: 'expense' },
      { name: 'Entertainment', color: '#EC4899', icon: '🎮', type: 'expense' },
      { name: 'Shopping', color: '#F43F5E', icon: '🛍️', type: 'expense' },
      { name: 'Healthcare', color: '#06B6D4', icon: '🏥', type: 'expense' },
      { name: 'Education', color: '#14B8A6', icon: '📚', type: 'expense' },
      { name: 'Travel', color: '#F97316', icon: '✈️', type: 'expense' },
      { name: 'Other', color: '#64748B', icon: '📌', type: 'expense' },
      
      // Income categories
      { name: 'Salary', color: '#10B981', icon: '💰', type: 'income' },
      { name: 'Freelance', color: '#3B82F6', icon: '💼', type: 'income' },
      { name: 'Investment', color: '#8B5CF6', icon: '📈', type: 'income' },
      { name: 'Gift', color: '#EC4899', icon: '🎁', type: 'income' },
      { name: 'Other', color: '#64748B', icon: '📌', type: 'income' }
    ];

    const existingCategories = await this.getAll();
    const batch: Omit<Category, 'id'>[] = [];
    
    for (const category of defaultCategories) {
      const exists = existingCategories.some(
        (c: Category) => c.name === category.name && c.type === category.type
      );
      
      if (!exists) {
        batch.push(category);
      }
    }
    
    // Add new categories in batch
    if (batch.length > 0) {
      const batchWrites = batch.map(cat => 
        addDoc(collection(db, 'categories'), cat)
      );
      await Promise.all(batchWrites);
    }
  }
};
