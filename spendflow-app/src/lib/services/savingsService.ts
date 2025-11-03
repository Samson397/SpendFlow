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
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { 
  SavingsAccount, 
  Transfer, 
  Transaction 
} from '@/types';
import { transactionsService } from './transactionsService';
import { cardsService } from './cardsService';

const SAVINGS_ACCOUNTS_COLLECTION = 'savingsAccounts';
const TRANSFERS_COLLECTION = 'transfers';

export const savingsAccountsService = {
  // Create a new savings account
  async createAccount(accountData: Omit<SavingsAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavingsAccount> {
    const id = uuidv4();
    const now = new Date();
    const account: SavingsAccount = {
      ...accountData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, SAVINGS_ACCOUNTS_COLLECTION, id), account);
    return account;
  },

  // Get a savings account by ID
  async getAccount(accountId: string): Promise<SavingsAccount | null> {
    const docRef = doc(db, SAVINGS_ACCOUNTS_COLLECTION, accountId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as SavingsAccount;
  },

  // Get all savings accounts for a user
  async getUserAccounts(userId: string): Promise<SavingsAccount[]> {
    const q = query(
      collection(db, SAVINGS_ACCOUNTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as SavingsAccount));
  },

  // Update a savings account
  async updateAccount(
    accountId: string, 
    updates: Partial<Omit<SavingsAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const accountRef = doc(db, SAVINGS_ACCOUNTS_COLLECTION, accountId);
    await updateDoc(accountRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  // Delete a savings account
  async deleteAccount(accountId: string): Promise<void> {
    const accountRef = doc(db, SAVINGS_ACCOUNTS_COLLECTION, accountId);
    await deleteDoc(accountRef);
  },

  // Create a transfer between accounts
  async createTransfer(transferData: Omit<Transfer, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Transfer> {
    const batch = writeBatch(db);
    const transferId = uuidv4();
    const now = new Date();
    
    // Create transfer record
    const transfer: Transfer = {
      ...transferData,
      id: transferId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    // Start transaction
    try {
      // 1. Create transfer record
      const transferRef = doc(db, TRANSFERS_COLLECTION, transferId);
      batch.set(transferRef, transfer);
      
      // 2. Update source account (debit)
      if (transferData.fromAccountType === 'card') {
        // Debit from card - need to get current balance first
        const cardDoc = await getDoc(doc(db, 'cards', transferData.fromAccountId));
        const currentBalance = cardDoc.data()?.balance || 0;
        const cardRef = doc(db, 'cards', transferData.fromAccountId);
        batch.update(cardRef, {
          balance: currentBalance - transferData.amount,
          updatedAt: now,
        });
      } else {
        // Debit from savings account - need to get current balance first
        const accountDoc = await getDoc(doc(db, SAVINGS_ACCOUNTS_COLLECTION, transferData.fromAccountId));
        const currentBalance = accountDoc.data()?.balance || 0;
        const accountRef = doc(db, SAVINGS_ACCOUNTS_COLLECTION, transferData.fromAccountId);
        batch.update(accountRef, {
          balance: currentBalance - transferData.amount,
          updatedAt: now,
        });
      }
      
      // 3. Update destination account (credit)
      if (transferData.toAccountType === 'card') {
        // Credit to card - need to get current balance first
        const cardDoc = await getDoc(doc(db, 'cards', transferData.toAccountId));
        const currentBalance = cardDoc.data()?.balance || 0;
        const cardRef = doc(db, 'cards', transferData.toAccountId);
        batch.update(cardRef, {
          balance: currentBalance + transferData.amount,
          updatedAt: now,
        });
      } else {
        // Credit to savings account - need to get current balance first
        const accountDoc = await getDoc(doc(db, SAVINGS_ACCOUNTS_COLLECTION, transferData.toAccountId));
        const currentBalance = accountDoc.data()?.balance || 0;
        const accountRef = doc(db, SAVINGS_ACCOUNTS_COLLECTION, transferData.toAccountId);
        batch.update(accountRef, {
          balance: currentBalance + transferData.amount,
          updatedAt: now,
        });
      }
      
      // 4. Create transaction records
      const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: transferData.userId,
        amount: transferData.amount,
        type: 'transfer',
        category: 'Transfer',
        description: transferData.description || 'Account Transfer',
        date: now,
        isRecurring: false,
        transferId: transferId,
      };
      
      // Source transaction
      const sourceTransactionRef = doc(collection(db, 'transactions'));
      batch.set(sourceTransactionRef, {
        ...transactionData,
        [transferData.fromAccountType === 'card' ? 'cardId' : 'savingsAccountId']: transferData.fromAccountId,
        type: 'withdrawal',
      });
      
      // Destination transaction
      const destTransactionRef = doc(collection(db, 'transactions'));
      batch.set(destTransactionRef, {
        ...transactionData,
        [transferData.toAccountType === 'card' ? 'cardId' : 'savingsAccountId']: transferData.toAccountId,
        type: 'deposit',
      });
      
      // 5. Update transfer status to completed
      batch.update(transferRef, { status: 'completed' });
      
      // Commit the batch
      await batch.commit();
      
      return transfer;
    } catch (error) {
      console.error('Transfer failed:', error);
      // Update transfer status to failed
      const transferRef = doc(db, TRANSFERS_COLLECTION, transferId);
      await updateDoc(transferRef, { 
        status: 'failed',
        updatedAt: new Date(),
      });
      
      throw new Error('Transfer failed. Please try again.');
    }
  },

  // Get transfer history for a user
  async getTransfers(userId: string): Promise<Transfer[]> {
    const q = query(
      collection(db, TRANSFERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Transfer));
  },

  // Get a single transfer by ID
  async getTransfer(transferId: string): Promise<Transfer | null> {
    const docRef = doc(db, TRANSFERS_COLLECTION, transferId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Transfer;
  },
};

export default savingsAccountsService;
