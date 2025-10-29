'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Expense } from '@/types';
import { expensesService, cardsService } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Other'
];

export function ExpenseModal({ expense, onClose, onSave }: ExpenseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || 'Food',
    paymentDate: expense?.paymentDate || 1,
    cardId: expense?.cardId || '',
  });

  useState(() => {
    if (user) {
      cardsService.getByUserId(user.uid).then(setCards);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'paymentDate' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      if (expense) {
        await expensesService.update(expense.id, formData);
      } else {
        await expensesService.create({
          userId: user.uid,
          ...formData,
          isActive: true,
        } as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
      }
      onSave();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Rent"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day</label>
            <input
              type="number"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              min="1"
              max="31"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card</label>
            <select
              name="cardId"
              value={formData.cardId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a card</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.cardHolder} - •••• {card.cardNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
