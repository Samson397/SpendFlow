'use client';

import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Card } from '@/types';
import toast from 'react-hot-toast';
import { alertsService } from '@/lib/alerts';

export interface RecurringPaymentResult {
  success: boolean;
  creditCardId: string;
  debitCardId: string;
  amount: number;
  transactionId?: string;
  error?: string;
}

export class RecurringPaymentService {
  /**
   * Process all recurring credit card payments that are due
   */
  static async processAllDuePayments(): Promise<RecurringPaymentResult[]> {
    const results: RecurringPaymentResult[] = [];

    try {
      // Get all credit cards that have auto-pay enabled and a payment source
      const creditCards = await this.getCreditCardsWithAutoPay();

      for (const creditCard of creditCards) {
        const result = await this.processSinglePayment(creditCard);
        results.push(result);
      }

      console.log(`Processed ${results.length} recurring payments`);
      return results;
    } catch (error) {
      console.error('Error processing recurring payments:', error);
      return results;
    }
  }

  /**
   * Get all credit cards with auto-pay enabled
   */
  private static async getCreditCardsWithAutoPay(): Promise<Card[]> {
    const cardsQuery = query(
      collection(db, 'cards'),
      where('type', '==', 'credit'),
      where('autoPayEnabled', '==', true)
    );

    const snapshot = await getDocs(cardsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Card[];
  }

  /**
   * Process a single credit card payment
   */
  private static async processSinglePayment(creditCard: Card): Promise<RecurringPaymentResult> {
    const result: RecurringPaymentResult = {
      success: false,
      creditCardId: creditCard.id,
      debitCardId: creditCard.paymentDebitCardId || '',
      amount: 0
    };

    try {
      // Check if payment source is configured
      if (!creditCard.paymentDebitCardId) {
        result.error = 'No payment source configured';

        // Create alert for user about missing payment source
        try {
          if (creditCard.userId) {
            await alertsService.paymentFailed(
              creditCard.userId,
              creditCard.name || 'Unknown Card',
              0,
              'No payment source configured for automatic payments',
              creditCard.id || ''
            );
          }
        } catch (alertError) {
          console.error('Failed to create payment failure alert:', alertError);
        }

        return result;
      }

      // Get the debit card
      const debitCard = await this.getCardById(creditCard.paymentDebitCardId);
      if (!debitCard) {
        result.error = 'Payment source card not found';
        return result;
      }

      // Calculate payment amount (minimum payment or full balance if less)
      const minimumPayment = creditCard.minimumPayment || Math.min(creditCard.balance * 0.03, 25); // 3% or $25 minimum
      const paymentAmount = Math.min(minimumPayment, creditCard.balance);

      if (paymentAmount <= 0) {
        result.error = 'No payment due';
        return result;
      }

      // Check if debit card has sufficient funds (considering overdraft)
      const availableBalance = debitCard.balance + (debitCard.overdraftLimit || 0);
      if (availableBalance < paymentAmount) {
        result.error = 'Insufficient funds in payment source';

        // Create alert for user about failed payment
        try {
          if (creditCard.userId) {
            await alertsService.paymentFailed(
              creditCard.userId,
              creditCard.name || 'Unknown Card',
              paymentAmount,
              'Insufficient funds in payment source account',
              creditCard.id || ''
            );
          }
        } catch (alertError) {
          console.error('Failed to create payment failure alert:', alertError);
        }

        return result;
      }

      // Check if it's the payment due date
      const today = new Date();
      const isDueDate = creditCard.paymentDueDay === today.getDate();

      if (!isDueDate) {
        result.error = 'Not payment due date';
        return result;
      }

      // Process the payment
      await this.executePayment(creditCard, debitCard, paymentAmount);

      result.success = true;
      result.amount = paymentAmount;

      // Create success alert for user
      try {
        await alertsService.paymentProcessed(
          creditCard.userId,
          creditCard.name || 'Unknown Card',
          paymentAmount,
          creditCard.id || ''
        );
      } catch (alertError) {
        console.error('Failed to create payment success alert:', alertError);
      }

      console.log(`Successfully processed payment of $${paymentAmount} from debit card ${debitCard.name} to credit card ${creditCard.name}`);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error processing payment:', error);
    }

    return result;
  }

  /**
   * Get a card by ID
   */
  private static async getCardById(cardId: string): Promise<Card | null> {
    const cardDoc = await getDocs(query(collection(db, 'cards'), where('__name__', '==', cardId)));
    if (!cardDoc.empty) {
      const doc = cardDoc.docs[0];
      return { id: doc.id, ...doc.data() } as Card;
    }
    return null;
  }

  /**
   * Execute the actual payment transfer
   */
  private static async executePayment(creditCard: Card, debitCard: Card, amount: number): Promise<void> {
    // Create transaction record
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      userId: creditCard.userId,
      amount: amount,
      type: 'transfer',
      category: 'Credit Card Payment',
      description: `Auto-payment to ${creditCard.name}`,
      date: new Date(),
      cardId: debitCard.id,
      isRecurring: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update balances
    await updateDoc(doc(db, 'cards', debitCard.id), {
      balance: debitCard.balance - amount,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'cards', creditCard.id), {
      balance: creditCard.balance - amount,
      updatedAt: new Date()
    });

    // Create transfer record
    await addDoc(collection(db, 'transfers'), {
      userId: creditCard.userId,
      fromAccountId: debitCard.id,
      fromAccountType: 'card',
      toAccountId: creditCard.id,
      toAccountType: 'card',
      amount: amount,
      description: `Auto-payment to ${creditCard.name}`,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Manually trigger payment for a specific credit card
   */
  static async processPaymentForCard(creditCardId: string): Promise<RecurringPaymentResult> {
    try {
      const creditCard = await this.getCardById(creditCardId);
      if (!creditCard) {
        return {
          success: false,
          creditCardId,
          debitCardId: '',
          amount: 0,
          error: 'Credit card not found'
        };
      }

      return await this.processSinglePayment(creditCard);
    } catch (error) {
      return {
        success: false,
        creditCardId,
        debitCardId: '',
        amount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get upcoming payments for a user
   */
  static async getUpcomingPayments(userId: string): Promise<Array<{
    creditCard: Card;
    debitCard: Card;
    amount: number;
    dueDate: Date;
  }>> {
    const upcomingPayments: Array<{
      creditCard: Card;
      debitCard: Card;
      amount: number;
      dueDate: Date;
    }> = [];

    try {
      const creditCards = await this.getCreditCardsWithAutoPay();
      const userCreditCards = creditCards.filter(card => card.userId === userId);

      for (const creditCard of userCreditCards) {
        if (!creditCard.paymentDebitCardId) continue;

        const debitCard = await this.getCardById(creditCard.paymentDebitCardId);
        if (!debitCard) continue;

        const minimumPayment = creditCard.minimumPayment || Math.min(creditCard.balance * 0.03, 25);
        const paymentAmount = Math.min(minimumPayment, creditCard.balance);

        if (paymentAmount <= 0) continue;

        // Calculate next due date
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let dueDate = new Date(currentYear, currentMonth, creditCard.paymentDueDay || 15);

        if (dueDate <= now) {
          dueDate = new Date(currentYear, currentMonth + 1, creditCard.paymentDueDay || 15);
        }

        upcomingPayments.push({
          creditCard,
          debitCard,
          amount: paymentAmount,
          dueDate
        });
      }

      return upcomingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  }

  /**
   * Check upcoming payments and send reminder alerts
   */
  static async sendPaymentReminders(): Promise<number> {
    let reminderCount = 0;

    try {
      const upcomingPayments = await this.getUpcomingPaymentsWithoutUserFilter();

      for (const payment of upcomingPayments) {
        const daysUntilDue = Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        // Send reminders for payments due in 1-7 days
        if (daysUntilDue >= 1 && daysUntilDue <= 7) {
          try {
            await alertsService.paymentDueReminder(
              payment.creditCard.userId,
              payment.creditCard.name || 'Unknown Card',
              payment.amount,
              payment.dueDate,
              daysUntilDue
            );
            reminderCount++;
          } catch (alertError) {
            console.error('Failed to create payment reminder alert:', alertError);
          }
        }
      }

      console.log(`Sent ${reminderCount} payment reminder alerts`);
      return reminderCount;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      return 0;
    }
  }

  /**
   * Get upcoming payments for all users (internal method for reminders)
   */
  private static async getUpcomingPaymentsWithoutUserFilter(): Promise<Array<{
    creditCard: Card;
    debitCard: Card;
    amount: number;
    dueDate: Date;
  }>> {
    const upcomingPayments: Array<{
      creditCard: Card;
      debitCard: Card;
      amount: number;
      dueDate: Date;
    }> = [];

    try {
      const creditCards = await this.getCreditCardsWithAutoPay();

      for (const creditCard of creditCards) {
        if (!creditCard.paymentDebitCardId) continue;

        const debitCard = await this.getCardById(creditCard.paymentDebitCardId);
        if (!debitCard) continue;

        const minimumPayment = creditCard.minimumPayment || Math.min(creditCard.balance * 0.03, 25);
        const paymentAmount = Math.min(minimumPayment, creditCard.balance);

        if (paymentAmount <= 0) continue;

        // Calculate next due date
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let dueDate = new Date(currentYear, currentMonth, creditCard.paymentDueDay || 15);

        if (dueDate <= now) {
          dueDate = new Date(currentYear, currentMonth + 1, creditCard.paymentDueDay || 15);
        }

        upcomingPayments.push({
          creditCard,
          debitCard,
          amount: paymentAmount,
          dueDate
        });
      }

      return upcomingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      return [];
    }
  }
}
