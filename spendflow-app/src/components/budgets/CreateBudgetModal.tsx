'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetService } from '@/lib/services/budgetService';
import { Budget, BudgetTemplate } from '@/types/budget';
import * as Lucide from 'lucide-react';
import toast from 'react-hot-toast';

// Standard categories from transaction system
const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'],
};

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCategory?: string;
}

export function CreateBudgetModal({ isOpen, onClose, onSuccess, initialCategory }: CreateBudgetModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customBudget, setCustomBudget] = useState<Partial<Budget>>({
    name: '',
    category: initialCategory || '',
    amount: 0,
    period: 'monthly',
    alertsEnabled: true,
    alertThreshold: 75,
  });

  useEffect(() => {
    if (isOpen) {
      setTemplates(BudgetService.getBudgetTemplates());
      setCustomBudget(prev => ({
        ...prev,
        category: initialCategory || '',
        name: initialCategory ? `${initialCategory} Budget` : '',
      }));
    }
  }, [isOpen, initialCategory]);

  const handleTemplateSelect = async (templateId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // Use a reasonable default income estimate for budget templates
      // In a real app, this would come from user profile or transaction data
      const estimatedMonthlyIncome = 4000; // Conservative default for budget calculations

      const budgetsToCreate = BudgetService.createBudgetFromTemplate(template, estimatedMonthlyIncome);

      for (const budget of budgetsToCreate) {
        await BudgetService.create({
          ...budget,
          userId: user.uid,
          spent: 0, // Will be calculated later
        });
      }

      toast.success(`Created ${budgetsToCreate.length} budgets from template!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating budgets from template:', error);
      toast.error('Failed to create budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      let endDate: Date;

      switch (customBudget.period) {
        case 'weekly':
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'yearly':
          endDate = new Date(now.getFullYear() + 1, 0, 0);
          break;
        default:
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      await BudgetService.create({
        userId: user.uid,
        name: customBudget.name || `${customBudget.category} Budget`,
        category: customBudget.category || '',
        amount: customBudget.amount || 0,
        spent: 0,
        period: customBudget.period || 'monthly',
        startDate: now,
        endDate,
        isActive: true,
        alertsEnabled: customBudget.alertsEnabled || true,
        alertThreshold: customBudget.alertThreshold || 75,
      });

      toast.success('Budget created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-slate-100">Create Budget</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200"
            >
              <Lucide.X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-serif text-slate-100 mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  disabled={loading}
                  className="p-4 bg-slate-800 border border-slate-600 rounded-lg hover:border-amber-500 hover:bg-slate-700 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lucide.Target className="h-5 w-5 text-amber-400" />
                    <h4 className="font-serif text-slate-100">{template.name}</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                  <p className="text-xs text-slate-500">{template.categories.length} categories</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-serif text-slate-100 mb-4">Or Create Custom Budget</h3>

            <form onSubmit={handleCustomBudgetSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-serif text-slate-300 mb-2">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    value={customBudget.name}
                    onChange={(e) => setCustomBudget(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Monthly Food Budget"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={customBudget.category}
                    onChange={(e) => setCustomBudget(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.expense.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-serif text-slate-300 mb-2">
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    value={customBudget.amount}
                    onChange={(e) => setCustomBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="500"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif text-slate-300 mb-2">
                    Period
                  </label>
                  <select
                    value={customBudget.period}
                    onChange={(e) => setCustomBudget(prev => ({ ...prev, period: e.target.value as 'weekly' | 'monthly' | 'yearly' }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-serif text-slate-300 mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={customBudget.alertThreshold}
                    onChange={(e) => setCustomBudget(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 75 }))}
                    placeholder="75"
                    min="1"
                    max="99"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="alerts-enabled"
                  checked={customBudget.alertsEnabled}
                  onChange={(e) => setCustomBudget(prev => ({ ...prev, alertsEnabled: e.target.checked }))}
                  className="h-4 w-4 bg-slate-800 border-slate-600 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="alerts-enabled" className="text-sm text-slate-300">
                  Enable budget alerts and notifications
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-serif tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Budget'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md font-serif tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
