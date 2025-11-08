export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number; // Budget limit
  spent: number; // Current spending
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  alertsEnabled: boolean;
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  type: 'warning' | 'exceeded' | 'approaching';
  message: string;
  percentage: number;
  createdAt: Date;
  read: boolean;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  categories: Array<{
    name: string;
    percentage: number; // Percentage of total budget
    description: string;
  }>;
  totalIncome?: number;
}
