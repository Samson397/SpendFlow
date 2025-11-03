'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';

export function DataExport() {
  const { user } = useAuth();
  const { formatAmount, currency } = useCurrency();
  const { canAccessFeature } = useSubscription();
  const [isExportingTransactions, setIsExportingTransactions] = useState(false);
  const [isExportingCards, setIsExportingCards] = useState(false);
  const [isExportingSummary, setIsExportingSummary] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const canExport = canAccessFeature('export');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data: unknown, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactions = async () => {
    if (!user || !canExport) return;

    setIsExportingTransactions(true);
    try {
      // Get all transactions and cards
      const [transactions, cards] = await Promise.all([
        transactionsService.getRecentByUserId(user.uid, 10000),
        cardsService.getByUserId(user.uid)
      ]);

      // Create a map of cardId to lastFour for quick lookup
      const cardMap = new Map<string, string>();
      cards.forEach(card => {
        if (card.id) {
          cardMap.set(card.id, card.lastFour || '****');
        }
      });

      const exportData = transactions.map(transaction => ({
        Date: formatDate(transaction.date),
        Type: transaction.type,
        Category: transaction.category,
        Description: transaction.description,
        Amount: transaction.amount,
        Currency: currency.code,
        Formatted_Amount: formatAmount(transaction.amount),
        Card_Last_4: transaction.cardId ? cardMap.get(transaction.cardId) || '****' : '',
        Savings_Account_ID: transaction.savingsAccountId || '',
        Is_Recurring: transaction.isRecurring ? 'Yes' : 'No',
        Recurring_Frequency: transaction.recurringFrequency || '',
        Created: formatDate(transaction.createdAt),
        Updated: formatDate(transaction.updatedAt)
      }));

      const filename = `spendflow_transactions_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

      if (exportFormat === 'csv') {
        downloadCSV(exportData, filename);
      } else {
        downloadJSON(exportData, filename);
      }

      toast.success(`Exported ${transactions.length} transactions successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsExportingTransactions(false);
    }
  };

  const exportCards = async () => {
    if (!user || !canExport) return;

    setIsExportingCards(true);
    try {
      // Get all user cards
      const cards = await cardsService.getByUserId(user.uid);

      const exportData = cards.map(card => ({
        Name: card.name || card.type,
        Type: card.type,
        Last_Four: card.lastFour || '****',
        Balance: card.balance,
        Currency: currency.code,
        Formatted_Balance: formatAmount(card.balance),
        Credit_Limit: card.limit || '',
        Formatted_Limit: card.limit ? formatAmount(card.limit) : '',
        Active: card.isActive ? 'Yes' : 'No',
        Created: formatDate(card.createdAt),
        Updated: formatDate(card.updatedAt)
      }));

      const filename = `spendflow_cards_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

      if (exportFormat === 'csv') {
        downloadCSV(exportData, filename);
      } else {
        downloadJSON(exportData, filename);
      }

      toast.success(`Exported ${cards.length} cards successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export cards');
    } finally {
      setIsExportingCards(false);
    }
  };

  const exportFinancialSummary = async () => {
    if (!user || !canExport) return;

    setIsExportingSummary(true);
    try {
      // Get transactions and cards for summary
      const [transactions, cards] = await Promise.all([
        transactionsService.getRecentByUserId(user.uid, 10000),
        cardsService.getByUserId(user.uid)
      ]);

      // Calculate summary stats
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

      const summary = {
        Export_Date: new Date().toISOString(),
        User_ID: user.uid,
        Currency: currency.code,
        Summary: {
          Total_Balance: totalBalance,
          Formatted_Balance: formatAmount(totalBalance),
          Total_Income: totalIncome,
          Formatted_Income: formatAmount(totalIncome),
          Total_Expenses: totalExpenses,
          Formatted_Expenses: formatAmount(totalExpenses),
          Net_Savings: totalIncome - totalExpenses,
          Formatted_Net_Savings: formatAmount(totalIncome - totalExpenses),
          Total_Transactions: transactions.length,
          Active_Cards: cards.filter(c => c.isActive).length,
          Total_Cards: cards.length
        },
        Transactions_Summary: transactions.reduce((acc, t) => {
          const month = t.date.toISOString().slice(0, 7); // YYYY-MM format
          if (!acc[month]) {
            acc[month] = { income: 0, expenses: 0, count: 0 };
          }
          if (t.type === 'income') {
            acc[month].income += t.amount;
          } else {
            acc[month].expenses += t.amount;
          }
          acc[month].count += 1;
          return acc;
        }, {} as Record<string, { income: number; expenses: number; count: number }>)
      };

      const filename = `spendflow_financial_summary_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

      if (exportFormat === 'csv') {
        // For CSV, we'll export the summary as a simple format
        const csvData = [
          { Metric: 'Export Date', Value: summary.Export_Date },
          { Metric: 'Total Balance', Value: summary.Summary.Formatted_Balance },
          { Metric: 'Total Income', Value: summary.Summary.Formatted_Income },
          { Metric: 'Total Expenses', Value: summary.Summary.Formatted_Expenses },
          { Metric: 'Net Savings', Value: summary.Summary.Formatted_Net_Savings },
          { Metric: 'Total Transactions', Value: summary.Summary.Total_Transactions.toString() },
          { Metric: 'Active Cards', Value: summary.Summary.Active_Cards.toString() }
        ];
        downloadCSV(csvData, filename);
      } else {
        downloadJSON(summary, filename);
      }

      toast.success('Financial summary exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export financial summary');
    } finally {
      setIsExportingSummary(false);
    }
  };

  if (!canExport) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-center">
          <FileSpreadsheet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Data Export</h3>
          <p className="text-slate-500 mb-4">Export your financial data for accounting and analysis.</p>
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-md p-4">
            <p className="text-amber-300 text-sm">
              🔒 Data export is available with Pro and Enterprise plans.
              <a href="/subscription" className="text-amber-400 hover:text-amber-300 underline ml-1">
                Upgrade now
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="h-6 w-6 text-amber-400" />
        <h3 className="text-lg font-semibold text-slate-100">Data Export</h3>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Export Format
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value as 'csv')}
              className="text-amber-400 focus:ring-amber-500"
            />
            <span className="text-slate-300">CSV (Excel compatible)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="json"
              checked={exportFormat === 'json'}
              onChange={(e) => setExportFormat(e.target.value as 'json')}
              className="text-amber-400 focus:ring-amber-500"
            />
            <span className="text-slate-300">JSON (Developer friendly)</span>
          </label>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-slate-700 rounded-md">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-400" />
            <div>
              <h4 className="font-medium text-slate-200">Transactions</h4>
              <p className="text-sm text-slate-400">All your income and expense records</p>
            </div>
          </div>
          <button
            onClick={exportTransactions}
            disabled={isExportingTransactions}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExportingTransactions ? 'Exporting...' : 'Export'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-700 rounded-md">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-green-400" />
            <div>
              <h4 className="font-medium text-slate-200">Cards & Accounts</h4>
              <p className="text-sm text-slate-400">Your card balances and account details</p>
            </div>
          </div>
          <button
            onClick={exportCards}
            disabled={isExportingCards}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExportingCards ? 'Exporting...' : 'Export'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-700 rounded-md">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-amber-400" />
            <div>
              <h4 className="font-medium text-slate-200">Financial Summary</h4>
              <p className="text-sm text-slate-400">Overview of your financial health</p>
            </div>
          </div>
          <button
            onClick={exportFinancialSummary}
            disabled={isExportingSummary}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExportingSummary ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800/50 rounded-md">
        <p className="text-xs text-slate-400">
          💡 <strong>Tip:</strong> Exported files are saved to your Downloads folder.
          CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.
        </p>
      </div>
    </div>
  );
}
