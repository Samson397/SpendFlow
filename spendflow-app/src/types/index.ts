export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  startDate: Date;
}

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
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
  };
  subscription: SubscriptionInfo;
  features: {
    maxCards: number;
    maxTransactions: number;
    analytics: boolean;
    export: boolean;
    prioritySupport: boolean;
  };
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

export interface Transaction {
  id: string;
  userId: string;
  cardId: string;
  amount: number;
  type: 'expense' | 'income' | 'refund' | 'transfer';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
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
