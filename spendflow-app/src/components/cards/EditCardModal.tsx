'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { Card } from '@/types';
import toast from 'react-hot-toast';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCardModal({ card, isOpen, onClose, onSuccess }: EditCardModalProps) {
  const [formData, setFormData] = useState({
    name: card.name || '',
    balance: card.balance || 0,
    expiryDate: card.expiryDate || '',
    color: card.color || '#3b82f6',
    creditLimit: card.creditLimit || 0,
    statementDay: card.statementDay || 1,
    paymentDueDay: card.paymentDueDay || 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      setFormData({
        name: card.name || '',
        balance: card.balance || 0,
        expiryDate: card.expiryDate || '',
        color: card.color || '#3b82f6',
        creditLimit: card.creditLimit || 0,
        statementDay: card.statementDay || 1,
        paymentDueDay: card.paymentDueDay || 1,
      });
    }
  }, [isOpen, card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build update object without undefined values
      const updateData: Partial<Card> = {
        name: formData.name,
        balance: Number(formData.balance),
        expiryDate: formData.expiryDate,
        color: formData.color,
      };

      // Only add credit card fields if it's a credit card
      if (card.type === 'credit') {
        updateData.creditLimit = Number(formData.creditLimit);
        updateData.statementDay = Number(formData.statementDay);
        updateData.paymentDueDay = Number(formData.paymentDueDay);
      }

      await cardsService.update(card.id, updateData);

      toast.success('Card updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating card:', error);
      
      // Check if the error is because the document doesn't exist
      if (error instanceof Error && error.message.includes('does not exist')) {
        toast.error('This card no longer exists. It may have been deleted. Refreshing card list...', {
          duration: 4000
        });
        // Refresh the cards list after a short delay
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        toast.error('Failed to update card');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Edit Card</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card Name */}
          <div>
            <label htmlFor="edit-card-name" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card Name
            </label>
            <input
              id="edit-card-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Visa Platinum"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Balance */}
          <div>
            <label htmlFor="edit-balance" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Current Balance
            </label>
            <input
              id="edit-balance"
              type="number"
              step="0.01"
              required
              value={isNaN(formData.balance) ? '' : formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="edit-expiry-date" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Expiry Date
            </label>
            <input
              id="edit-expiry-date"
              type="text"
              required
              maxLength={5}
              value={formData.expiryDate}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  setFormData({ ...formData, expiryDate: `${value.slice(0, 2)}/${value.slice(2, 4)}` });
                } else {
                  setFormData({ ...formData, expiryDate: value });
                }
              }}
              placeholder="MM/YY"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
            <p className="text-slate-500 text-xs mt-1">Format: MM/YY (e.g., 12/25)</p>
          </div>

          {/* Credit Card Specific Fields */}
          {card.type === 'credit' && (
            <>
              {/* Credit Limit */}
              <div>
                <label htmlFor="edit-credit-limit" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Credit Limit
                </label>
                <input
                  id="edit-credit-limit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) })}
                  placeholder="5000.00"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                />
                <p className="text-slate-500 text-xs mt-1">Maximum credit available</p>
              </div>

              {/* Statement Day */}
              <div>
                <label htmlFor="edit-statement-day" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Statement Day
                </label>
                <select
                  id="edit-statement-day"
                  value={formData.statementDay}
                  onChange={(e) => setFormData({ ...formData, statementDay: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">Day of month when statement is generated</p>
              </div>

              {/* Payment Due Day */}
              <div>
                <label htmlFor="edit-payment-due-day" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Payment Due Day
                </label>
                <select
                  id="edit-payment-due-day"
                  value={formData.paymentDueDay}
                  onChange={(e) => setFormData({ ...formData, paymentDueDay: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">Day of month when payment is due</p>
              </div>
            </>
          )}

          {/* Color */}
          <div>
            <label className="block text-slate-400 text-xs tracking-widest uppercase mb-3 font-serif">
              Card Color
            </label>

            {/* Color Palette */}
            <div className="grid grid-cols-4 gap-3">
              {[
                '#3b82f6', // Blue
                '#10b981', // Emerald
                '#f59e0b', // Amber
                '#ef4444', // Red
                '#8b5cf6', // Purple
                '#ec4899', // Pink
                '#06b6d4', // Cyan
                '#84cc16', // Lime
                '#f97316', // Orange
                '#6366f1', // Indigo
                '#14b8a6', // Teal
                '#eab308', // Yellow
                '#dc2626', // Crimson
                '#7c3aed', // Violet
                '#0d9488', // Dark Teal
                '#a855f7'  // Magenta
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-xl border-2 transition-all ${
                    formData.color === color ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-600 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color`}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-xs tracking-wider mb-2">Or pick any color</p>
              <div className="flex justify-center">
                <input
                  type="color"
                  value={formData.color.startsWith('#') ? formData.color : '#3b82f6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                  title="Choose any custom color"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors tracking-wider uppercase text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-600 text-slate-900 hover:bg-amber-500 transition-colors tracking-wider uppercase text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
