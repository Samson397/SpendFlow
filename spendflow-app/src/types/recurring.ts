export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  cardId: string;
  frequency: RecurringFrequency;
  dayOfMonth: number; // 1-31 for monthly
  isActive: boolean;
  startDate: string;
  endDate?: string; // Optional end date
  lastProcessed?: string; // Last time it was auto-created
  createdAt: string;
  updatedAt: string;
}
