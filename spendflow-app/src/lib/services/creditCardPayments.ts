import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Card } from '@/types';

interface CreditCardPayment {
  id: string;
  creditCardId: string;
  debitCardId: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const creditCardPaymentService = {
  /**
   * Process credit card payments that are due today
   * This should be run daily (via cron job or manual trigger)
   */
  async processDuePayments(userId: string): Promise<void> {
    const today = new Date();
    const currentDay = today.getDate();

    // Get all credit cards for user
    const cardsQuery = query(
      collection(db, 'cards'),
      where('userId', '==', userId),
      where('type', '==', 'credit'),
      where('isActive', '==', true)
    );

    const cardsSnapshot = await getDocs(cardsQuery);
    const creditCards = cardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Card));

    // Filter cards where payment is due today
    const cardsDueToday = creditCards.filter(card => 
      card.paymentDueDay === currentDay && 
      card.paymentDebitCardId && 
      card.autoPayEnabled
    );

    // Process each payment
    for (const creditCard of cardsDueToday) {
      await this.processPayment(creditCard);
    }
  },

  /**
   * Process payment for a single credit card
   * Calculates total expenses from last statement to now and deducts from debit card
   */
  async processPayment(creditCard: Card): Promise<void> {
    try {
      const debitCardId = creditCard.paymentDebitCardId;

      if (!debitCardId) {
        console.log(`No debit card linked for card ${creditCard.id}`);
        return;
      }

      // Calculate billing cycle
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const statementDay = creditCard.statementDay || 1;
      
      // Last statement date (start of billing cycle)
      const lastStatementDate = new Date(currentYear, currentMonth - 1, statementDay);
      // Current statement date (end of billing cycle)
      const currentStatementDate = new Date(currentYear, currentMonth, statementDay);

      // Get all expenses on this credit card during billing cycle
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', creditCard.userId),
        where('cardId', '==', creditCard.id),
        where('type', '==', 'expense')
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const allTransactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter transactions within billing cycle
      const billingCycleTransactions = allTransactions.filter(transaction => {
        const transactionDate = transaction.date instanceof Date 
          ? transaction.date 
          : new Date((transaction.date as any).toDate());
        
        return transactionDate >= lastStatementDate && transactionDate < currentStatementDate;
      });

      // Calculate total amount due
      const paymentAmount = billingCycleTransactions.reduce((sum, t: any) => sum + t.amount, 0);

      if (paymentAmount <= 0) {
        console.log(`No payment needed for card ${creditCard.id}`);
        return;
      }

      // Get debit card
      const debitCardDoc = await getDocs(
        query(collection(db, 'cards'), where('__name__', '==', debitCardId))
      );

      if (debitCardDoc.empty) {
        throw new Error('Debit card not found');
      }

      const debitCard = { id: debitCardDoc.docs[0].id, ...debitCardDoc.docs[0].data() } as Card;

      // Check if debit card has sufficient balance
      if (debitCard.balance < paymentAmount) {
        throw new Error('Insufficient funds in debit card');
      }

      // Create payment transaction
      const paymentTransaction = {
        creditCardId: creditCard.id,
        debitCardId: debitCard.id,
        amount: paymentAmount,
        paymentDate: new Date().toISOString(),
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      // 1. Deduct from debit card
      await updateDoc(doc(db, 'cards', debitCard.id), {
        balance: debitCard.balance - paymentAmount,
        updatedAt: new Date(),
      });

      // 2. Increase credit card available balance (payment clears the debt)
      await updateDoc(doc(db, 'cards', creditCard.id), {
        balance: creditCard.balance + paymentAmount,
        updatedAt: new Date(),
      });

      // 3. Create transaction record for debit card (expense)
      await addDoc(collection(db, 'transactions'), {
        userId: creditCard.userId,
        cardId: debitCard.id,
        amount: paymentAmount,
        type: 'expense',
        category: 'Credit Card Payment',
        description: `Payment for ${creditCard.name || 'Credit Card'} ••${creditCard.lastFour}`,
        date: new Date().toISOString(),
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 4. Create transaction record for credit card (payment)
      await addDoc(collection(db, 'transactions'), {
        userId: creditCard.userId,
        cardId: creditCard.id,
        amount: paymentAmount,
        type: 'income', // Payment reduces credit card balance
        category: 'Payment',
        description: `Payment from ${debitCard.name || 'Debit Card'} ••${debitCard.lastFour}`,
        date: new Date().toISOString(),
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 5. Record payment
      await addDoc(collection(db, 'creditCardPayments'), paymentTransaction);

      console.log(`✅ Payment processed: $${paymentAmount} from ${debitCard.id} to ${creditCard.id}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Record failed payment
      await addDoc(collection(db, 'creditCardPayments'), {
        creditCardId: creditCard.id,
        debitCardId: creditCard.paymentDebitCardId,
        amount: creditCard.balance,
        paymentDate: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Get payment history for a credit card
   */
  async getPaymentHistory(creditCardId: string): Promise<CreditCardPayment[]> {
    const paymentsQuery = query(
      collection(db, 'creditCardPayments'),
      where('creditCardId', '==', creditCardId)
    );

    const snapshot = await getDocs(paymentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CreditCardPayment));
  },

  /**
   * Calculate next payment date for a credit card
   */
  getNextPaymentDate(card: Card): Date | null {
    if (!card.paymentDueDay) return null;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // If payment day hasn't passed this month, it's this month
    if (currentDay < card.paymentDueDay) {
      return new Date(currentYear, currentMonth, card.paymentDueDay);
    }

    // Otherwise, it's next month
    return new Date(currentYear, currentMonth + 1, card.paymentDueDay);
  },

  /**
   * Get days until next payment
   */
  getDaysUntilPayment(card: Card): number | null {
    const nextPayment = this.getNextPaymentDate(card);
    if (!nextPayment) return null;

    const today = new Date();
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
};
