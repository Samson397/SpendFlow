'use client';

import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCardModal({ isOpen, onClose, onSuccess }: AddCardModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'debit' as 'debit' | 'credit',
    lastFour: '',
    balance: '',
    color: '#3b82f6',
    creditLimit: '',
    statementDay: '1',
    paymentDueDay: '15',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a card name');
      return;
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      alert('Please enter a valid balance');
      return;
    }

    if (formData.type === 'credit') {
      const creditLimit = parseFloat(formData.creditLimit);
      if (isNaN(creditLimit) || creditLimit <= 0) {
        alert('Please enter a valid credit limit greater than 0');
        return;
      }
      
      const statementDay = parseInt(formData.statementDay);
      const paymentDueDay = parseInt(formData.paymentDueDay);
      if (isNaN(statementDay) || statementDay < 1 || statementDay > 31) {
        alert('Please enter a valid statement day (1-31)');
        return;
      }
      if (isNaN(paymentDueDay) || paymentDueDay < 1 || paymentDueDay > 31) {
        alert('Please enter a valid payment due day (1-31)');
        return;
      }
    }

    try {
      setLoading(true);
      await cardsService.create({
        userId: user.uid,
        name: formData.name,
        lastFour: formData.lastFour,
        cardNumber: `****${formData.lastFour}`,
        cardHolder: user.displayName || 'Card Holder',
        expiryDate: '12/25',
        cvv: '***',
        balance: parseFloat(formData.balance) || 0,
        type: formData.type,
        color: formData.color,
        isActive: true,
        // Credit card specific fields
        ...(formData.type === 'credit' && {
          statementDay: parseInt(formData.statementDay),
          paymentDueDay: parseInt(formData.paymentDueDay),
          creditLimit: parseFloat(formData.creditLimit) || parseFloat(formData.balance) || 0,
        }),
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        lastFour: '',
        balance: '',
        type: 'debit',
        color: '#3b82f6',
        creditLimit: '',
        statementDay: '1',
        paymentDueDay: '15',
      });
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Add New Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Card Name */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chase Sapphire"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'debit' })}
                className={`py-3 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'debit'
                    ? 'border-amber-600 text-amber-400 bg-amber-900/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Debit
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'credit' })}
                className={`py-3 border transition-colors tracking-wider uppercase text-sm ${
                  formData.type === 'credit'
                    ? 'border-amber-600 text-amber-400 bg-amber-900/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                Credit
              </button>
            </div>
          </div>

          {/* Last Four Digits */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Last 4 Digits
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={formData.lastFour}
              onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
              placeholder="1234"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
              />
            </div>
          </div>

          {/* Credit Card Specific Fields */}
          {formData.type === 'credit' && (
            <>
              {/* Credit Limit */}
              <div>
                <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Credit Limit
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    type="number"
                    step="100"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="5000.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Maximum credit available on this card</p>
              </div>

              {/* Statement Day */}
              <div>
                <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Statement Day
                </label>
                <select
                  value={formData.statementDay}
                  onChange={(e) => setFormData({ ...formData, statementDay: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">When your statement is generated</p>
              </div>

              {/* Payment Due Day */}
              <div>
                <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Payment Due Day
                </label>
                <select
                  value={formData.paymentDueDay}
                  onChange={(e) => setFormData({ ...formData, paymentDueDay: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">When payment is due from your debit card</p>
              </div>
            </>
          )}

          {/* Color Picker */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card Color
            </label>
            <div className="flex gap-3">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              disabled={loading}
              className="flex-1 px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
