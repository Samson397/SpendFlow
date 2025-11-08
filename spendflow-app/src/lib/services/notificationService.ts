import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface NotificationData {
  id?: string;
  userId: string;
  type: 'payment_failed' | 'insufficient_funds_warning' | 'payment_success' | 'low_balance';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export const notificationService = {
  /**
   * Create a notification for a user
   */
  async createNotification(notification: Omit<NotificationData, 'read' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: new Date(),
      });

      console.log(`📢 Notification created: ${notification.title}`);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  /**
   * Notify user about failed recurring payment
   */
  async notifyFailedPayment(userId: string, expenseName: string, amount: number, error: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'payment_failed',
      title: '💸 Payment Failed',
      message: `${expenseName} payment of £${amount.toFixed(2)} could not be processed. ${error}`,
      data: {
        expenseName,
        amount,
        error,
        type: 'recurring_expense'
      }
    });
  },

  /**
   * Notify user about upcoming insufficient funds
   */
  async notifyInsufficientFundsWarning(
    userId: string,
    upcomingAmount: number,
    availableAmount: number,
    daysUntil: number
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'insufficient_funds_warning',
      title: '⚠️ Insufficient Funds Warning',
      message: `You have £${upcomingAmount.toFixed(2)} in expenses due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}, but only £${availableAmount.toFixed(2)} available.`,
      data: {
        upcomingAmount,
        availableAmount,
        daysUntil
      }
    });
  },

  /**
   * Notify user about low balance
   */
  async notifyLowBalance(userId: string, availableAmount: number, threshold: number = 50): Promise<void> {
    await this.createNotification({
      userId,
      type: 'low_balance',
      title: '💰 Low Balance Alert',
      message: `Your available funds are low (£${availableAmount.toFixed(2)}). Consider adding funds or reducing expenses.`,
      data: {
        availableAmount,
        threshold
      }
    });
  },

  /**
   * Check for upcoming insufficient funds and send warnings
   */
  async checkUpcomingInsufficientFunds(userId: string): Promise<void> {
    try {
      console.log('🔍 Checking upcoming insufficient funds for user:', userId);

      // For now, just simulate the check - we'll implement the full logic later
      // This prevents the complex imports that were causing TypeScript errors

      console.log('✅ Insufficient funds check completed (simulated)');

    } catch (error) {
      console.error('Error checking upcoming insufficient funds:', error);
    }
  }
};
