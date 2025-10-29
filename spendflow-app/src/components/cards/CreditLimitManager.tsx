'use client';

import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CreditLimitManagerProps {
  cardId: string;
  cardName: string;
  currentBalance: number;
  currentLimit: number;
  onRequestIncrease: (newLimit: number, reason: string) => Promise<void>;
}

export function CreditLimitManager({
  cardId,
  cardName,
  currentBalance,
  currentLimit,
  onRequestIncrease,
}: CreditLimitManagerProps) {
  const { formatAmount } = useCurrency();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestedLimit, setRequestedLimit] = useState(currentLimit.toString());
  const [reason, setReason] = useState('');

  const utilizationPercent = (currentBalance / currentLimit) * 100;
  const availableCredit = currentLimit - currentBalance;

  const getUtilizationColor = () => {
    if (utilizationPercent >= 90) return 'text-red-400';
    if (utilizationPercent >= 70) return 'text-amber-400';
    return 'text-green-400';
  };

  const getUtilizationBgColor = () => {
    if (utilizationPercent >= 90) return 'bg-red-600';
    if (utilizationPercent >= 70) return 'bg-amber-600';
    return 'bg-green-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLimit = parseFloat(requestedLimit);
    
    if (newLimit <= currentLimit) {
      alert('New limit must be higher than current limit');
      return;
    }

    setLoading(true);
    try {
      await onRequestIncrease(newLimit, reason);
      setShowRequestForm(false);
      setRequestedLimit(currentLimit.toString());
      setReason('');
    } catch (error) {
      console.error('Error requesting limit increase:', error);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Utilization Display */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-300 text-sm font-serif tracking-wider uppercase">
            Credit Utilization
          </h3>
          {!showRequestForm && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="text-amber-400 hover:text-amber-300 text-xs tracking-wider uppercase flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              Request Increase
            </button>
          )}
        </div>

        {/* Utilization Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">
              {formatAmount(currentBalance)} of {formatAmount(currentLimit)}
            </span>
            <span className={`text-sm font-serif ${getUtilizationColor()}`}>
              {utilizationPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getUtilizationBgColor()} transition-all duration-300`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Available Credit */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Available Credit</span>
          <span className="text-slate-200 font-serif">{formatAmount(availableCredit)}</span>
        </div>

        {/* Warning if high utilization */}
        {utilizationPercent >= 70 && (
          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-amber-400 text-xs">
              {utilizationPercent >= 90
                ? 'High utilization! Consider requesting a limit increase or paying down balance.'
                : 'Utilization above 70%. Keep it below 30% for better credit score.'}
            </p>
          </div>
        )}
      </div>

      {/* Request Increase Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl md:text-2xl font-serif text-slate-100 tracking-wide mb-1">
                  REQUEST LIMIT INCREASE
                </h2>
                <p className="text-slate-500 text-sm">{cardName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Current Limit */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="text-slate-500 text-xs tracking-wider uppercase mb-1">
                  Current Limit
                </div>
                <div className="text-2xl font-serif text-slate-100">
                  {formatAmount(currentLimit)}
                </div>
              </div>

              {/* Requested Limit */}
              <div>
                <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
                  Requested New Limit
                </label>
                <input
                  type="number"
                  required
                  step="100"
                  min={currentLimit + 100}
                  value={requestedLimit}
                  onChange={(e) => setRequestedLimit(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors text-lg font-serif"
                  placeholder={`Minimum: ${formatAmount(currentLimit + 100)}`}
                />
                {parseFloat(requestedLimit) > currentLimit && (
                  <p className="mt-2 text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Increase of {formatAmount(parseFloat(requestedLimit) - currentLimit)}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-300 text-sm font-serif tracking-wider uppercase mb-2">
                  Reason for Increase (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:border-amber-600 focus:outline-none transition-colors resize-none"
                  placeholder="E.g., Increased income, business expenses, travel plans..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-amber-900/10 border border-amber-700/30 rounded-lg p-4">
                <p className="text-amber-400 text-sm">
                  💡 Limit increase requests are typically processed within 1-3 business days. 
                  You'll be notified once approved.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-800 bg-slate-900/30">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-200 transition-colors tracking-wider uppercase text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || parseFloat(requestedLimit) <= currentLimit}
                className="px-6 py-3 bg-amber-600 text-slate-100 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 transition-colors tracking-wider uppercase text-sm font-serif"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
