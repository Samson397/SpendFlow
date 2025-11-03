'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, Plus, CreditCard } from 'lucide-react';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import { Transaction } from '@/types';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { AuthGate } from '@/components/auth/AuthGate';
import { useAccessControl } from '@/lib/services/accessControlService';
import toast from 'react-hot-toast';

function IncomePageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { canAddTransaction } = useAccessControl();
  const [income, setIncome] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasCards, setHasCards] = useState(false);
  const [showNoCardsMessage, setShowNoCardsMessage] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadIncome();
    checkCards();

    // Add window focus listener to re-check cards when returning to page
    const handleFocus = () => {
      checkCards();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadIncome = async () => {
    try {
      setLoading(true);
      const transactions = await transactionsService.getRecentByUserId(user!.uid, 100);
      setIncome(transactions.filter(t => t.type === 'income'));
    } catch (error) {
      console.error('Error loading income:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCards = async () => {
    try {
      const cards = await cardsService.getByUserId(user!.uid);
      setHasCards(cards.length > 0);
    } catch (error) {
      console.error('Error checking cards:', error);
    }
  };

  const handleAddIncomeClick = async () => {
    if (!user) return;

    try {
      const cards = await cardsService.getByUserId(user.uid);
      if (cards.length === 0) {
        setShowNoCardsMessage(true);
        return;
      }

      // Check if user can add a transaction based on their subscription
      const accessResult = await canAddTransaction();

      if (!accessResult.allowed) {
        if (accessResult.upgradeRequired) {
          toast.error(
            accessResult.reason || 'Upgrade your plan to add more transactions',
            {
              duration: 5000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #f59e0b',
              },
            }
          );
          // TODO: Add upgrade prompt/modal here
        } else {
          toast.error(accessResult.reason || 'Cannot add transaction at this time');
        }
        return;
      }

      setShowModal(true);
    } catch (error) {
      console.error('Error checking cards or access:', error);
    }
  };

  const handleSuccess = () => {
    loadIncome();
  };

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        defaultType="income"
      />

      {/* No Cards Message */}
      {showNoCardsMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-slate-100 mb-2 tracking-wide">
                No Cards Found
              </h3>
              <p className="text-slate-400 text-sm tracking-wide">
                Please add a card first before adding income
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowNoCardsMessage(false);
                  router.push('/cards');
                }}
                className="w-full px-6 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowNoCardsMessage(false)}
                className="w-full px-6 py-3 border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="w-8 sm:w-12 md:w-16 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4 md:mb-6"></div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif text-slate-100 mb-1 sm:mb-2 tracking-wide">
            I N C O M E
          </h1>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto sm:mx-0 mb-3 sm:mb-4"></div>
          <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">Revenue Overview</p>
        </div>
        <button
          onClick={handleAddIncomeClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 transition-colors tracking-wider uppercase text-sm rounded-md touch-manipulation min-h-[44px]"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Add Income
        </button>
      </div>

      {/* Total */}
      <div className="bg-linear-to-br from-amber-900/20 via-slate-900/50 to-slate-900/20 border border-amber-700/30 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-amber-400/60 text-xs tracking-widest uppercase mb-3 sm:mb-4 font-serif">Total Income</div>
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-100 mb-2">{formatAmount(totalIncome)}</div>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm tracking-wider">{income.length} Transactions</span>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div>
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-8 sm:w-12 h-0.5 bg-linear-to-r from-amber-600 to-transparent"></div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-slate-100 tracking-wide">Recent Income</h2>
        </div>

        {income.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {income.map((item) => (
              <div
                key={item.id}
                className="border-b border-slate-800 py-4 sm:py-6 hover:bg-slate-900/30 transition-colors rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className="w-1 h-10 sm:h-12 bg-green-600 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-200 font-serif mb-1 text-sm sm:text-base truncate">{item.description}</div>
                      <div className="text-xs text-slate-600 tracking-wider uppercase">{item.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-lg sm:text-xl font-serif text-green-400">
                      +{formatAmount(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 md:py-20 border border-slate-800 bg-slate-900/30 rounded-lg">
            <div className="text-slate-500 mb-4 text-lg font-serif">No income recorded</div>
            <p className="text-slate-600 text-sm tracking-wide">Your income tracking will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncomePage() {
  return (
    <AuthGate>
      <IncomePageContent />
    </AuthGate>
  );
}
