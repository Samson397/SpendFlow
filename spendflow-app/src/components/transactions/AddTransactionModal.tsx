'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Camera } from 'lucide-react';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ScanReceiptModal } from './ScanReceiptModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense';
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'],
};

export function AddTransactionModal({ isOpen, onClose, onSuccess, defaultType = 'expense' }: AddTransactionModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [cards, setCards] = useState<Array<{ id: string; name?: string; type: string; lastFour?: string; balance: number }>>([]);
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: '',
    category: '',
    description: '',
    cardId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleScanData = (data: { amount: number; merchant: string; date?: string; category?: string }) => {
    setFormData(prev => ({
      ...prev,
      amount: data.amount.toString(),
      description: data.merchant,
      category: data.category || 'Other',
      date: data.date || prev.date,
    }));
    setShowScanModal(false);
  };

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
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, cardId: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description or merchant name');
      return;
    }
    
    if (!formData.cardId) {
      alert('Please select a card');
      return;
    }

    try {
      setLoading(true);
      
      // Create transaction
      await transactionsService.create({
        userId: user.uid,
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        cardId: formData.cardId,
        date: new Date(formData.date),
        isRecurring: false,
      });

      // Update card balance
      const card = cards.find(c => c.id === formData.cardId);
      if (card) {
        // DEBIT CARD: Update balance immediately
        if (card.type === 'debit') {
          const newBalance = formData.type === 'income' 
            ? card.balance + parseFloat(formData.amount)  // Income adds money
            : card.balance - parseFloat(formData.amount); // Expense removes money
          
          await cardsService.update(formData.cardId, { balance: newBalance });
        } 
        // CREDIT CARD: Decrease available balance to show real-time usage
        else if (card.type === 'credit') {
          if (formData.type === 'expense') {
            // Expense decreases available credit (shows how much you've spent)
            const newBalance = card.balance - parseFloat(formData.amount);
            await cardsService.update(formData.cardId, { balance: newBalance });
          } else if (formData.type === 'income') {
            // Payment increases available credit
            const newBalance = card.balance + parseFloat(formData.amount);
            await cardsService.update(formData.cardId, { balance: newBalance });
          }
          // On payment due date, the accumulated expenses will be paid from linked debit card
          // and the available balance will be restored
        }
      }
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        type: defaultType,
        amount: '',
        category: '',
        description: '',
        cardId: cards[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScanReceiptModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onDataExtracted={handleScanData}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-slate-950 border border-amber-700/30 rounded-lg max-w-sm w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {formData.type === 'income' ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-amber-400" />
              )}
              <h2 className="text-2xl font-serif text-slate-100 tracking-wide">
                Add {formData.type === 'income' ? 'Income' : 'Expense'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {formData.type === 'expense' && (
                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Scan Receipt"
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`py-3 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'income'
                    ? 'border-green-600 text-green-400 bg-green-900/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`py-3 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'expense'
                    ? 'border-amber-600 text-amber-400 bg-amber-900/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            >
              <option value="">Select category</option>
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
              placeholder="e.g., Grocery shopping"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Card Selection */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card/Account
            </label>
            <select
              required
              value={formData.cardId}
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            >
              {cards.length === 0 ? (
                <option value="">No cards available</option>
              ) : (
                cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name || card.type} - {card.type} (••{card.lastFour || '****'})
                  </option>
                ))
              )}
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
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors tracking-wider uppercase text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || cards.length === 0}
              className="flex-1 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
