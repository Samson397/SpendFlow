'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { cardsService } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCardModal({ isOpen, onClose, onSuccess }: AddCardModalProps) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [debitCards, setDebitCards] = useState<Array<{id: string, name: string, lastFour: string}>>([]);
  const [formData, setFormData] = useState<{
    name: string;
    type: 'debit' | 'credit';
    lastFour: string;
    expiryDate: string;
    balance: string;
    color: string;
    creditLimit: string;
    statementDay: string;
    paymentDueDay: string;
    overdraftLimit: string;
    paymentSourceCardId: string;
    autoPayEnabled: boolean;
    minimumPayment: string;
  }>({
    name: '',
    type: 'debit' as 'debit' | 'credit',
    lastFour: '',
    expiryDate: '',
    balance: '',
    color: '#3b82f6',
    creditLimit: '',
    statementDay: '1',
    paymentDueDay: '15',
    overdraftLimit: '', // For debit cards
    paymentSourceCardId: '', // For credit cards - which debit card to use for payments
    autoPayEnabled: false, // Auto-pay toggle for credit cards
    minimumPayment: '', // Minimum payment amount
  });

  if (!isOpen) return null;

  // Fetch debit cards when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchDebitCards = async () => {
        try {
          const cardsQuery = query(collection(db, 'cards'), 
            where('userId', '==', user.uid),
            where('type', '==', 'debit')
          );
          const cardsSnapshot = await getDocs(cardsQuery);
          const debitCardsData = cardsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'Unnamed Card',
            lastFour: doc.data().lastFour || '****'
          }));
          setDebitCards(debitCardsData);
        } catch (error) {
          console.error('Error fetching debit cards:', error);
        }
      };
      fetchDebitCards();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to add cards');
      return;
    }

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter a card name');
      return;
    }

    if (!formData.lastFour || formData.lastFour.length !== 4) {
      toast.error('Please enter the last 4 digits of your card');
      return;
    }

    // Validate expiry date format (MM/YY)
    if (!formData.expiryDate) {
      toast.error('Please enter the card expiry date');
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(formData.expiryDate)) {
      toast.error('Please enter expiry date in MM/YY format (e.g., 12/25)');
      return;
    }

    // Validate expiry date is not in the past
    const [month, year] = formData.expiryDate.split('/').map(Number);
    const expiryYear = 2000 + year;
    const expiryDate = new Date(expiryYear, month - 1);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (expiryDate < new Date(currentYear, currentMonth)) {
      const errorMsg = 'Card expiry date cannot be in the past. Please enter a valid future expiry date.';
      toast.error(errorMsg);
      alert(errorMsg);
      return;
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      toast.error('Please enter a valid balance');
      return;
    }

    if (formData.type === 'credit') {
      const creditLimit = parseFloat(formData.creditLimit);
      if (isNaN(creditLimit) || creditLimit <= 0) {
        toast.error('Please enter a valid credit limit greater than 0');
        return;
      }

      const statementDay = parseInt(formData.statementDay);
      const paymentDueDay = parseInt(formData.paymentDueDay);
      if (isNaN(statementDay) || statementDay < 1 || statementDay > 31) {
        toast.error('Please enter a valid statement day (1-31)');
        return;
      }
      if (isNaN(paymentDueDay) || paymentDueDay < 1 || paymentDueDay > 31) {
        toast.error('Please enter a valid payment due day (1-31)');
        return;
      }
    }

    try {
      setLoading(true);

      // Check for duplicate cards
      const existingCards = await cardsService.getByUserId(user.uid);
      const duplicateCard = existingCards.find(card => card.lastFour === formData.lastFour);

      if (duplicateCard) {
        const errorMsg = `A card ending in ${formData.lastFour} already exists. Please check your cards or enter different digits.`;
        toast.error(errorMsg);
        alert(errorMsg);
        return;
      }

      await cardsService.create({
        userId: user.uid,
        name: formData.name,
        lastFour: formData.lastFour,
        cardNumber: `****${formData.lastFour}`,
        cardHolder: user.displayName || user.email?.split('@')[0] || 'Card Holder',
        expiryDate: formData.expiryDate,
        cvv: '***',
        balance: parseFloat(formData.balance) || 0,
        type: formData.type,
        color: formData.color,
        isActive: true,
        // Debit card specific fields
        ...(formData.type === 'debit' && formData.overdraftLimit && {
          overdraftLimit: parseFloat(formData.overdraftLimit),
        }),
        // Credit card specific fields
        ...(formData.type === 'credit' && {
          statementDay: parseInt(formData.statementDay),
          paymentDueDay: parseInt(formData.paymentDueDay),
          creditLimit: parseFloat(formData.creditLimit) || parseFloat(formData.balance) || 0,
          paymentDebitCardId: formData.paymentSourceCardId || undefined,
          autoPayEnabled: formData.autoPayEnabled,
          minimumPayment: formData.minimumPayment ? parseFloat(formData.minimumPayment) : undefined,
        }),
      });

      onSuccess();
      onClose();

      toast.success('Card added successfully!');

      // Reset form
      setFormData({
        name: '',
        lastFour: '',
        expiryDate: '',
        balance: '',
        type: 'debit',
        color: '#3b82f6',
        creditLimit: '',
        statementDay: '1',
        paymentDueDay: '15',
        overdraftLimit: '',
        paymentSourceCardId: '',
        autoPayEnabled: false,
        minimumPayment: '',
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card. Please try again.');
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
            {/* @ts-expect-error Conflicting React types between lucide-react and project */}
            <CreditCard className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Add New Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {/* @ts-expect-error Conflicting React types between lucide-react and project */}
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Card Name */}
          <div>
            <label htmlFor="card-name" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Card Name
            </label>
            <input
              id="card-name"
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
            <label htmlFor="last-four" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Last 4 Digits
            </label>
            <input
              id="last-four"
              type="text"
              required
              maxLength={4}
              value={formData.lastFour}
              onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
              placeholder="1234"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiry-date" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Expiry Date
            </label>
            <input
              id="expiry-date"
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

          {/* Balance */}
          <div>
            <label htmlFor="balance" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
              <input
                id="balance"
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
                <label htmlFor="credit-limit" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Credit Limit
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    id="credit-limit"
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
                <label htmlFor="statement-day" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Statement Day
                </label>
                <select
                  id="statement-day"
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
                <label htmlFor="payment-due-day" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Payment Due Day
                </label>
                <select
                  id="payment-due-day"
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

          {/* Debit Card Specific Fields */}
          {formData.type === 'debit' && (
            <>
              {/* Overdraft Limit */}
              <div>
                <label htmlFor="overdraft-limit" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Overdraft Limit
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    id="overdraft-limit"
                    type="number"
                    step="50"
                    value={formData.overdraftLimit}
                    onChange={(e) => setFormData({ ...formData, overdraftLimit: e.target.value })}
                    placeholder="500.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Maximum overdraft amount allowed (optional)</p>
              </div>
            </>
          )}

          {/* Credit Card Specific Fields - Payment Source */}
          {formData.type === 'credit' && debitCards.length > 0 && (
            <>
              {/* Payment Source */}
              <div>
                <label htmlFor="payment-source" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Payment Source
                </label>
                <select
                  id="payment-source"
                  value={formData.paymentSourceCardId}
                  onChange={(e) => setFormData({ ...formData, paymentSourceCardId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                >
                  <option value="">Select debit card for auto-payment</option>
                  {debitCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} (****{card.lastFour})
                    </option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">Which debit card to use for automatic credit card payments</p>
              </div>

              {/* Auto Pay Toggle */}
              <div>
                <label className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Auto-Pay
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoPayEnabled: !formData.autoPayEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.autoPayEnabled ? 'bg-amber-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.autoPayEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">
                    {formData.autoPayEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">Automatically pay this credit card using the selected debit card</p>
              </div>

              {/* Minimum Payment */}
              <div>
                <label htmlFor="minimum-payment" className="block text-slate-400 text-xs tracking-widest uppercase mb-2 font-serif">
                  Minimum Payment
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                  <input
                    id="minimum-payment"
                    type="number"
                    step="0.01"
                    value={formData.minimumPayment}
                    onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                    placeholder="25.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors font-serif"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Minimum amount to pay each month (leave empty for 3% of balance or $25 minimum)</p>
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
                  aria-label={`Select ${color} color`}
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
