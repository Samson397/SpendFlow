'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'],
};

export function EditTransactionModal({ isOpen, transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cards, setCards] = useState<Array<{ id: string; name?: string; type: string; balance: number }>>([]);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    cardId: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (transaction && isOpen) {
      const transactionDate = transaction.date instanceof Date
        ? transaction.date
        : typeof transaction.date === 'object' && 'toDate' in transaction.date
        ? (transaction.date as { toDate: () => Date }).toDate()
        : new Date(transaction.date);

      setFormData({
        type: (transaction.type === 'income' || transaction.type === 'expense') ? transaction.type : 'expense',
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || '',
        cardId: transaction.cardId || '',
        date: transactionDate.toISOString().split('T')[0],
      });
    }
  }, [transaction, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      loadCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const loadCards = async () => {
    try {
      const data = await cardsService.getByUserId(user!.uid);
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !transaction) return;

    // Validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!formData.cardId) {
      alert('Please select a card');
      return;
    }

    try {
      setLoading(true);

      // Calculate balance difference
      const oldAmount = transaction.amount;
      const newAmount = parseFloat(formData.amount);
      const oldCard = cards.find(c => c.id === transaction.cardId);
      const newCard = cards.find(c => c.id === formData.cardId);

      // Revert old transaction's effect on old card
      if (oldCard) {
        // Reverse the original transaction
        const revertedBalance = transaction.type === 'income'
          ? oldCard.balance - oldAmount  // Remove the income that was added
          : oldCard.balance + oldAmount;  // Restore the expense that was deducted
        
        await cardsService.update(oldCard.id, { balance: revertedBalance });
      }

      // Apply new transaction to new card
      if (newCard) {
        // Apply the new transaction (same logic as AddTransactionModal)
        const newBalance = formData.type === 'income'
          ? newCard.balance + newAmount  // Income adds to balance
          : newCard.balance - newAmount;  // Expense reduces balance
        
        await cardsService.update(newCard.id, { balance: newBalance });
      }

      // Update transaction
      await transactionsService.update(transaction.id, {
        type: formData.type,
        amount: newAmount,
        category: formData.category,
        description: formData.description,
        cardId: formData.cardId,
        date: new Date(formData.date),
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !user) return;
    
    const confirmed = confirm('Are you sure you want to delete this transaction? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);

      // Revert transaction's effect on card balance
      const card = cards.find(c => c.id === transaction.cardId);
      if (card) {
        
        // For both credit and debit: reverse the original transaction
        // If it was an expense (decreased balance), add it back
        // If it was income (increased balance), subtract it back
        const revertedBalance = transaction.type === 'income'
          ? card.balance - transaction.amount  // Remove the income that was added
          : card.balance + transaction.amount;  // Restore the expense that was deducted
        
        await cardsService.update(card.id, { balance: revertedBalance });
      }

      // Delete transaction
      await transactionsService.delete(transaction.id);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg max-w-sm w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-2xl font-serif text-slate-100 tracking-wide">
            Edit Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-4 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-3 px-4 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'expense'
                    ? 'border-amber-600 bg-amber-900/20 text-amber-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-3 px-4 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'income'
                    ? 'border-green-600 bg-green-900/20 text-green-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            >
              {categories[formData.type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Card */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card
            </label>
            <select
              value={formData.cardId}
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name || 'Card'} - {card.type}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="px-6 py-3 border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors tracking-wider uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors tracking-wider uppercase text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deleting}
              className="flex-1 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
