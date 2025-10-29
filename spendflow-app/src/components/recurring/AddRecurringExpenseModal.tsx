'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { recurringExpensesService } from '@/lib/firebase/recurringExpenses';
import { cardsService } from '@/lib/firebase/firestore';
import { Card } from '@/types';

interface AddRecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export function AddRecurringExpenseModal({ isOpen, onClose, onSuccess }: AddRecurringExpenseModalProps) {
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

  const loadCards = async () => {
    try {
      const userCards = await cardsService.getByUserId(user!.uid);
      setCards(userCards);
      if (userCards.length > 0 && !formData.cardId) {
        setFormData(prev => ({ ...prev, cardId: userCards[0].id }));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await recurringExpensesService.create({
        userId: user.uid,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        cardId: formData.cardId,
        frequency: 'monthly',
        dayOfMonth: parseInt(formData.dayOfMonth),
        isActive: true,
        startDate: new Date().toISOString(),
      });

      // Reset form
      setFormData({
        name: '',
        amount: '',
        category: 'Subscription',
        cardId: cards[0]?.id || '',
        dayOfMonth: '1',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating recurring expense:', error);
      alert('Failed to create recurring expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide mb-1">
              ADD RECURRING EXPENSE
            </h2>
            <p className="text-slate-500 text-sm tracking-wider">Set up automatic monthly expenses</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Name */}
          <div>
            <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
              Expense Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Netflix, Rent, Phone Bill..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Monthly Amount
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Card */}
          <div>
            <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
              <CreditCard className="inline h-4 w-4 mr-1" />
              Payment Card
            </label>
            <select
              value={formData.cardId}
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
              required
            >
              {cards.length === 0 ? (
                <option value="">No cards available</option>
              ) : (
                cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} (••{card.lastFour || '****'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Day of Month */}
          <div>
            <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Day of Month
            </label>
            <select
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-amber-900/10 border border-amber-700/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm tracking-wide">
              💡 This expense will automatically be created on the {formData.dayOfMonth}
              {formData.dayOfMonth === '1' ? 'st' : formData.dayOfMonth === '2' ? 'nd' : formData.dayOfMonth === '3' ? 'rd' : 'th'} of each month
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-800 bg-slate-900/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200 transition-colors tracking-wider uppercase text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || cards.length === 0}
            className="px-6 py-3 bg-amber-600 text-slate-100 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 transition-colors tracking-wider uppercase text-sm font-serif"
          >
            {loading ? 'Creating...' : 'Add Recurring Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
