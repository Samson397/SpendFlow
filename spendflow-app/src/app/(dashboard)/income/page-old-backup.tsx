'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { incomeService } from '@/lib/firebase/firestore';
import { Income } from '@/types';
import { IncomeModal } from '@/components/income/IncomeModal';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function IncomePage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    if (!user) return;
    loadIncomes();
  }, [user]);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const data = await incomeService.getByUserId(user!.uid);
      setIncomes(data);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = () => {
    setEditingIncome(null);
    setShowModal(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowModal(true);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeService.delete(incomeId);
        setIncomes(incomes.filter(i => i.id !== incomeId));
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleSaveIncome = async () => {
    await loadIncomes();
    setShowModal(false);
  };

  const now = new Date();
  const monthlyIncome = incomes
    .filter(i => i.date >= startOfMonth(now) && i.date <= endOfMonth(now))
    .reduce((sum, i) => sum + i.amount, 0);

  const categoryIcons: Record<string, string> = {
    'Salary': '💼',
    'Freelance': '🎨',
    'Investment': '📈',
    'Gift': '🎁',
    'Other': '📌',
  };

  const categoryColors: Record<string, string> = {
    'Salary': '#10B981',
    'Freelance': '#3B82F6',
    'Investment': '#8B5CF6',
    'Gift': '#EC4899',
    'Other': '#64748B',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Income</h1>
        <Button onClick={handleAddIncome} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-linear-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
          <p className="text-sm text-gray-600 mt-2">{incomes.length} income entries</p>
        </CardContent>
      </Card>

      {incomes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No income entries yet</p>
            <Button onClick={handleAddIncome} variant="outline">
              Add Your First Income
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: categoryColors[income.category] + '20' }}
                >
                  {categoryIcons[income.category] || '📌'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{income.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{income.category}</span>
                    <span>•</span>
                    <span>{format(income.date, 'MMM d, yyyy')}</span>
                    {income.isRecurring && (
                      <>
                        <span>•</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          {income.recurringFrequency}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(income.amount)}</p>
                  <p className="text-xs text-gray-500">income</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditIncome(income)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncome(income.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <IncomeModal
          income={editingIncome}
          onClose={() => setShowModal(false)}
          onSave={handleSaveIncome}
        />
      )}
    </div>
  );
}
