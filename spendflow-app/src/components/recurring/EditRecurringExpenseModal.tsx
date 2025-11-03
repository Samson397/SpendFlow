'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, DollarSign, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { cardsService } from '@/lib/firebase/firestore';
import { Card } from '@/types';
import { RecurringExpense } from '@/types/recurring';

interface EditRecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense: RecurringExpense | null;
}

const categories = [
  'Subscription',
  'Utilities',
  'Rent/Mortgage',
  'Insurance',
  'Loan Payment',
  'Membership',
  'Phone Bill',
  'Internet',
  'Streaming',
  'Other',
];

export function EditRecurringExpenseModal({ isOpen, onClose, onSuccess, expense }: EditRecurringExpenseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Subscription',
    cardId: '',
    dayOfMonth: '1',
  });

  useEffect(() => {
    if (user && isOpen) {
      loadCards();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        cardId: expense.cardId,
        dayOfMonth: expense.dayOfMonth.toString(),
      });
    }
  }, [expense, isOpen]);

  const loadCards = async () => {
    try {
      const userCards = await cardsService.getByUserId(user!.uid);
      setCards(userCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expense) return;

    try {
      setLoading(true);
      await recurringExpensesService.update(expense.id, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        cardId: formData.cardId,
        dayOfMonth: parseInt(formData.dayOfMonth),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Edit Recurring Expense</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expense Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
                placeholder="e.g., Netflix Subscription"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Associated Card
              </label>
              <select
                value={formData.cardId}
                onChange={(e) => setFormData(prev => ({ ...prev, cardId: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
                required
              >
                <option value="">Select a card</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} •••• {card.lastFour}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Day of Month
              </label>
              <select
                value={formData.dayOfMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>{day}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-200 transition-colors rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
