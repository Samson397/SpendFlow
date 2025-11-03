// Export all subscription types
export * from './subscription';

// Legacy exports for backward compatibility
export type { SubscriptionInfo } from './subscription';
export type { PlanLimits } from './subscription';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string;
  isAdmin?: boolean;
  disabled?: boolean;
  emailVerified?: boolean;
  lastActive?: Date;
  subscriptionTier?: SubscriptionTier; // For admin management
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
  };
  subscription: SubscriptionInfo;
  features: PlanLimits;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  userId: string;
  name?: string; // Card name (e.g., "Visa Platinum")
  lastFour?: string; // Last 4 digits
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  type: 'credit' | 'debit';
  balance: number;
  limit?: number;
  color: string;
  isActive: boolean;
  // Credit card specific fields
  statementDay?: number; // Day of month statement is generated (1-31)
  paymentDueDay?: number; // Day of month payment is due (1-31)
  paymentDebitCardId?: string; // ID of debit card used for auto-payment
  autoPayEnabled?: boolean; // Whether auto-payment is enabled
  minimumPayment?: number; // Minimum payment amount
  // Credit limit management
  creditLimit?: number; // Current credit limit
  requestedLimit?: number; // Requested new limit
  limitIncreaseHistory?: LimitIncreaseRequest[]; // History of limit changes
  createdAt: Date;
  updatedAt: Date;
}

export interface LimitIncreaseRequest {
  id: string;
  cardId: string;
  userId: string;
  currentLimit: number;
  requestedLimit: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  notes?: string;
}

export interface SavingsAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'savings' | 'checking';
  balance: number;
  currency: string;
  name: string;
  interestRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  fromAccountType: 'card' | 'savings';
  toAccountId: string;
  toAccountType: 'card' | 'savings';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  cardId?: string;
  savingsAccountId?: string;
  amount: number;
  type: 'expense' | 'income' | 'refund' | 'transfer' | 'deposit' | 'withdrawal';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  transferId?: string; // Reference to Transfer document for transfer transactions
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  cardId: string;
  amount: number;
  category: string;
  description: string;
  paymentDate: number; // Day of month (1-31)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'expense' | 'income';
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  incomeVsExpenses: { date: string; income: number; expenses: number }[];
  spendingByCategory: { category: string; amount: number; color: string }[];
  recentTransactions: (Transaction & { card?: Card })[];
}
