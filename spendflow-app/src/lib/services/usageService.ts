import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface UsageStats {
  cardsUsed: number;
  transactionsCount: number;
  reportsGenerated: number;
  monthStart: Date;
  monthEnd: Date;
}

export class UsageService {
  private static instance: UsageService;

  static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService();
    }
    return UsageService.instance;
  }

  /**
   * Get usage statistics for the current month
   */
  async getCurrentMonthUsage(userId: string): Promise<UsageStats> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [cardsUsed, transactionsCount, reportsGenerated] = await Promise.all([
      this.getCardsCreatedThisMonth(userId, monthStart, monthEnd),
      this.getTransactionsThisMonth(userId, monthStart, monthEnd),
      this.getReportsGeneratedThisMonth(userId, monthStart, monthEnd)
    ]);

    return {
      cardsUsed,
      transactionsCount,
      reportsGenerated,
      monthStart,
      monthEnd
    };
  }

  /**
   * Count cards created this month
   */
  private async getCardsCreatedThisMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const cardsRef = collection(db, 'cards');
      const q = query(
        cardsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error counting cards created this month:', error);
      return 0;
    }
  }

  /**
   * Count transactions this month
   */
  private async getTransactionsThisMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error counting transactions this month:', error);
      return 0;
    }
  }

  /**
   * Count reports generated this month (analytics views)
   * Note: This requires activity tracking to be implemented
   */
  private async getReportsGeneratedThisMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      // For now, return 0 since activity tracking isn't implemented
      // This could be expanded to track specific report generations
      // when activity logging is added to the app
      return 0;
    } catch (error) {
      console.error('Error counting reports generated this month:', error);
      return 0;
    }
  }

  /**
   * Check if user is approaching plan limits
   */
  async checkUsageLimits(userId: string, planLimits: { maxCards: number; maxTransactions: number }): Promise<{
    cardsNearLimit: boolean;
    transactionsNearLimit: boolean;
    cardsAtLimit: boolean;
    transactionsAtLimit: boolean;
  }> {
    const usage = await this.getCurrentMonthUsage(userId);

    const cardsNearLimit = planLimits.maxCards !== -1 && usage.cardsUsed >= planLimits.maxCards * 0.8;
    const transactionsNearLimit = planLimits.maxTransactions !== -1 && usage.transactionsCount >= planLimits.maxTransactions * 0.8;
    const cardsAtLimit = planLimits.maxCards !== -1 && usage.cardsUsed >= planLimits.maxCards;
    const transactionsAtLimit = planLimits.maxTransactions !== -1 && usage.transactionsCount >= planLimits.maxTransactions;

    return {
      cardsNearLimit,
      transactionsNearLimit,
      cardsAtLimit,
      transactionsAtLimit
    };
  }
}

export const usageService = UsageService.getInstance();
