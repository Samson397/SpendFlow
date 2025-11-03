'use client';

import { useState, useEffect } from 'react';
import { X, PiggyBank, Banknote, DollarSign } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { savingsAccountsService } from '@/lib/services/savingsService';
import { SavingsAccount } from '@/types';

interface EditSavingsAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: SavingsAccount | null;
}

const accountTypes = [
  { value: 'savings', label: 'Savings Account', icon: PiggyBank },
  { value: 'checking', label: 'Checking Account', icon: Banknote },
];

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
];

export function EditSavingsAccountModal({ isOpen, onClose, onSuccess, account }: EditSavingsAccountModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    accountType: 'savings',
    currency: 'USD',
    interestRate: '',
  });

  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        name: account.name,
        accountType: account.accountType,
        currency: account.currency,
        interestRate: account.interestRate?.toString() || '',
      });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !account) return;

    try {
      setLoading(true);
      await savingsAccountsService.updateAccount(account.id, {
        name: formData.name,
        accountType: formData.accountType as 'savings' | 'checking',
        currency: formData.currency,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating account:', error);
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
            <h2 className="text-2xl font-serif text-slate-100 tracking-wide">Edit Savings Account</h2>
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
                Account Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {accountTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, accountType: type.value }))}
                      className={`p-4 border rounded-lg transition-all ${
                        formData.accountType === type.value
                          ? 'border-amber-600 bg-amber-600/10 text-amber-400'
                          : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
              >
                {currencies.map(currency => (
                  <option key={currency.value} value={currency.value}>{currency.label}</option>
                ))}
              </select>
            </div>

            {formData.accountType === 'savings' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Interest Rate (APY %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                    className="w-full pl-4 pr-12 py-3 bg-slate-900/50 border border-slate-700 text-slate-100 rounded focus:border-amber-600 focus:outline-none transition-colors"
                    placeholder="e.g., 1.5"
                  />
                  <span className="absolute right-3 top-3 text-slate-400">%</span>
                </div>
              </div>
            )}

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
                {loading ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
