'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { expensesService } from '@/lib/firebase/firestore';
import { Expense } from '@/types';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (!user) return;
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesService.getActiveByUserId(user!.uid);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesService.delete(expenseId);
        setExpenses(expenses.filter(e => e.id !== expenseId));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleSaveExpense = async () => {
    await loadExpenses();
    setShowModal(false);
  };

  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryColors: Record<string, string> = {
    'Housing': '#3B82F6',
    'Food': '#10B981',
    'Transportation': '#F59E0B',
    'Utilities': '#8B5CF6',
    'Entertainment': '#EC4899',
    'Shopping': '#F43F5E',
    'Healthcare': '#06B6D4',
    'Education': '#14B8A6',
    'Travel': '#F97316',
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
        <h1 className="text-3xl font-bold text-gray-900">Recurring Expenses</h1>
        <Button onClick={handleAddExpense} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalMonthlyExpenses)}</div>
          <p className="text-sm text-gray-600 mt-2">{expenses.length} recurring expenses</p>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No recurring expenses yet</p>
            <Button onClick={handleAddExpense} variant="outline">
              Add Your First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: categoryColors[expense.category] || '#64748B' }}
                >
                  {expense.category.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>Day {expense.paymentDate} of month</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
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
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setShowModal(false)}
          onSave={handleSaveExpense}
        />
      )}
    </div>
  );
}
