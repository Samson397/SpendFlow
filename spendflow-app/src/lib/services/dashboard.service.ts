import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { 
  transactionsService, 
  expensesService, 
  incomeService,
  cardsService 
} from '@/lib/firebase/firestore';
import { DashboardData, Transaction, Card } from '@/types';

interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

interface MonthData {
  start: Date;
  end: Date;
  label: string;
}

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    
    // Get last 6 months for the income vs expenses chart
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, 'MMM yyyy')
      };
    });

    // Get all necessary data in parallel
    const [
      recentTransactions,
      monthlyExpenses,
      monthlyIncome,
      incomeVsExpensesData,
      spendingByCategory
    ] = await Promise.all([
      // Get recent transactions
      transactionsService.getRecentByUserId(userId, 5),
      
      // Get total expenses for current month
      transactionsService.getTotalByType(
        userId, 
        'expense', 
        startOfCurrentMonth, 
        endOfCurrentMonth
      ),
      
      // Get total income for current month
      incomeService.getTotalByPeriod(
        userId, 
        startOfCurrentMonth, 
        endOfCurrentMonth
      ),
      
      // Get income vs expenses data for last 6 months
      this.getIncomeVsExpensesData(userId, months),
      
      // Get spending by category for current month
      expensesService.getByCategory(
        userId, 
        startOfCurrentMonth, 
        endOfCurrentMonth
      )
    ]);

    // Calculate net savings
    const netSavings = monthlyIncome - monthlyExpenses;

    // Get card details for transactions
    const transactionsWithCards = await Promise.all(
      recentTransactions.map(async (transaction) => {
        if (!transaction.cardId) return transaction;
        const card = await cardsService.get(transaction.cardId);
        return { ...transaction, card };
      })
    );

    return {
      totalBalance: await this.calculateTotalBalance(userId),
      monthlyIncome,
      monthlyExpenses,
      netSavings,
      incomeVsExpenses: incomeVsExpensesData,
      spendingByCategory: this.enrichCategories(spendingByCategory),
      recentTransactions: transactionsWithCards
    };
  },

  async calculateTotalBalance(userId: string): Promise<number> {
    const cards = await cardsService.getByUserId(userId);
    return cards.reduce((sum: number, card: Card) => sum + (card.balance || 0), 0);
  },

  async getIncomeVsExpensesData(
    userId: string, 
    months: MonthData[]
  ) {
    const data = await Promise.all(
      months.map(async ({ start, end, label }) => {
        const [income, expenses] = await Promise.all([
          incomeService.getTotalByPeriod(userId, start, end),
          transactionsService.getTotalByType(
            userId, 
            'expense', 
            start, 
            end
          )
        ]);

        return {
          date: label,
          income,
          expenses: Math.abs(expenses) // Make expenses positive for the chart
        };
      })
    );

    return data;
  },

  enrichCategories(
    categories: { category: string; amount: number }[]
  ): CategorySpending[] {
    // This would be replaced with actual category data from your database
    const categoryColors: Record<string, string> = {
      'Housing': '#3B82F6',
      'Food': '#10B981',
      'Transportation': '#F59E0B',
      'Utilities': '#8B5CF6',
      'Entertainment': '#EC4899',
      'Shopping': '#F43F5E',
      'Healthcare': '#06B6D4',
      'Education': '#14B8A6',
      'Travel': '#F97316',
      'Other': '#64748B',
      'Salary': '#10B981',
      'Freelance': '#3B82F6',
      'Investment': '#8B5CF6',
      'Gift': '#EC4899'
    };

    return categories.map(item => ({
      ...item,
      color: categoryColors[item.category] || '#94A3B8'
    }));
  },

  async getRecentActivity(userId: string, limit = 10): Promise<Transaction[]> {
    return transactionsService.getRecentByUserId(userId, limit);
  }
};
