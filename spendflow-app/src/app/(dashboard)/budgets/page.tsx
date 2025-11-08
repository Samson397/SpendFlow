'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetService } from '@/lib/services/budgetService';
import { Budget } from '@/types/budget';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { CreateBudgetModal } from '@/components/budgets/CreateBudgetModal';
import * as Lucide from 'lucide-react';

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = BudgetService.subscribeToBudgets(user.uid, (budgetData) => {
      setBudgets(budgetData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleBudgetSuccess = () => {
    setSelectedBudget(null);
    console.log('Budget created/updated successfully');
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowCreateModal(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      try {
        await BudgetService.delete(budgetId);
        console.log('Budget deleted successfully');
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const activeBudgets = budgets.filter(b => b.isActive);
  const inactiveBudgets = budgets.filter(b => !b.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-amber-400 text-lg font-serif tracking-wider">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-2 tracking-wide">
            B U D G E T S
          </h1>
          <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
            Track spending limits and achieve financial goals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border transition-colors tracking-wider uppercase text-sm w-full sm:w-auto justify-center"
          style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
        >
          <span className="text-lg">+</span>
          <span className="hidden xs:inline">Create Budget</span>
          <span className="xs:hidden">Budget</span>
        </button>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
          <div className="text-2xl mb-2 text-blue-400">📊</div>
          <div className="text-2xl font-serif text-slate-100 mb-1">{budgets.length}</div>
          <div className="text-sm text-slate-400">Total Budgets</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
          <div className="text-2xl mb-2 text-green-400">✅</div>
          <div className="text-2xl font-serif text-slate-100 mb-1">{activeBudgets.length}</div>
          <div className="text-sm text-slate-400">Active Budgets</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm text-center">
          <div className="text-2xl mb-2 text-amber-400">🎯</div>
          <div className="text-2xl font-serif text-slate-100 mb-1">
            {activeBudgets.filter(b => BudgetService.getBudgetStatus(b).status === 'safe').length}
          </div>
          <div className="text-sm text-slate-400">On Track</div>
        </div>
      </div>

      {/* Active Budgets */}
      {activeBudgets.length > 0 && (
        <div>
          <h2 className="text-xl font-serif mb-6 text-slate-100">Active Budgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Budgets */}
      {inactiveBudgets.length > 0 && (
        <div>
          <h2 className="text-xl font-serif mb-6 text-slate-300">Inactive Budgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {inactiveBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {budgets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-amber-400 mb-4">
            <Lucide.Target className="h-16 w-16 sm:h-20 sm:w-20 mx-auto opacity-80" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif text-slate-100 mb-4 font-semibold">
            No Budgets Yet
          </h3>
          <p className="text-slate-300 mb-8 text-sm sm:text-base tracking-wide px-4 max-w-2xl mx-auto">
            Create your first budget to start tracking spending limits and working towards your financial goals.
            Choose from pre-made templates or create custom budgets for specific categories.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 border-2 border-amber-600 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500 transition-colors tracking-wider uppercase text-sm rounded-md font-semibold shadow-lg hover:shadow-amber-500/20"
          >
            Create Your First Budget
          </button>
        </div>
      )}

      {/* Budget Tips */}
      {budgets.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-lg font-serif text-slate-100 mb-4 flex items-center gap-2">
            <Lucide.Lightbulb className="h-5 w-5 text-amber-400" />
            Budget Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-green-400 mt-0.5">💡</div>
              <div>
                <div className="text-sm font-medium text-slate-200">50/30/20 Rule</div>
                <div className="text-sm text-slate-400">
                  Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-blue-400 mt-0.5">🎯</div>
              <div>
                <div className="text-sm font-medium text-slate-200">Set Realistic Goals</div>
                <div className="text-sm text-slate-400">
                  Start with achievable budgets and gradually increase your savings targets.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-amber-400 mt-0.5">📊</div>
              <div>
                <div className="text-sm font-medium text-slate-200">Track Regularly</div>
                <div className="text-sm text-slate-400">
                  Review your budgets weekly to stay on track and adjust as needed.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-purple-400 mt-0.5">🚀</div>
              <div>
                <div className="text-sm font-medium text-slate-200">Automate Savings</div>
                <div className="text-sm text-slate-400">
                  Set up automatic transfers to savings accounts to build wealth effortlessly.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedBudget(null);
        }}
        onSuccess={handleBudgetSuccess}
        initialCategory={selectedBudget?.category}
      />
    </div>
  );
}
