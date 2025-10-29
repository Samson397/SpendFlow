'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TransactionModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  'Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities',
  'Healthcare', 'Education', 'Travel', 'Other'
];

export function TransactionModal({ onClose, onSave }: TransactionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'Food',
    type: 'expense' as 'expense' | 'income' | 'refund',
    date: new Date().toISOString().split('T')[0],
    cardId: '',
    isRecurring: false,
  });

  useState(() => {
    if (user) {
      cardsService.getByUserId(user.uid).then(setCards);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      await transactionsService.create({
        userId: user.uid,
        ...formData,
        date: new Date(formData.date),
        recurringFrequency: undefined,
      } as Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>);
      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Add Transaction</h2>
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
              placeholder="e.g., Coffee"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="refund">Refund</option>
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
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
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
