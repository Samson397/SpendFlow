'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: any;
  description: string;
};

type CardType = {
  id: string;
  name: string;
  balance: number;
  type: 'credit' | 'debit';
  lastFour: string;
  color: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];
        
        setTransactions(transactionsData.slice(0, 5));

        // Calculate stats
        const income = transactionsData
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = transactionsData
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        // Fetch cards
        const cardsQuery = query(collection(db, 'cards'), where('userId', '==', user.uid));
        const cardsSnapshot = await getDocs(cardsQuery);
        const cardsData = cardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CardType[];
        
        setCards(cardsData);
        
        const totalBalance = cardsData.reduce((sum, card) => sum + card.balance, 0);
        
        setStats({
          totalBalance,
          income,
          expenses,
          savings: income - expenses,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const categoryData = [
    { name: 'Food', value: 450, color: '#60a5fa' },
    { name: 'Shopping', value: 280, color: '#34d399' },
    { name: 'Bills', value: 500, color: '#fbbf24' },
    { name: 'Transport', value: 150, color: '#f87171' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.displayName || 'User'}</p>
        </div>
        <button
          onClick={() => router.push('/transactions')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <TrendingUp className="h-5 w-5 text-white/60" />
          </div>
          <div className="text-white/80 text-sm font-medium mb-1">Total Balance</div>
          <div className="text-3xl font-bold text-white">${stats.totalBalance.toLocaleString()}</div>
        </div>

        {/* Income */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-green-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-xs text-green-500 font-medium">+12.5%</span>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Income</div>
          <div className="text-2xl font-bold text-white">${stats.income.toLocaleString()}</div>
        </div>

        {/* Expenses */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-xs text-red-500 font-medium">-8.3%</span>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Expenses</div>
          <div className="text-2xl font-bold text-white">${stats.expenses.toLocaleString()}</div>
        </div>

        {/* Savings */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-xs text-blue-500 font-medium">+5.2%</span>
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Savings</div>
          <div className="text-2xl font-bold text-white">${stats.savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Overview */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Spending Overview</h3>
            <select className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-600">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', income: 400, expenses: 240 },
                { name: 'Tue', income: 300, expenses: 139 },
                { name: 'Wed', income: 200, expenses: 980 },
                { name: 'Thu', income: 278, expenses: 390 },
                { name: 'Fri', income: 189, expenses: 480 },
                { name: 'Sat', income: 239, expenses: 380 },
                { name: 'Sun', income: 349, expenses: 430 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="income" fill="#34d399" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Category Breakdown</h3>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-slate-300">{cat.name}</span>
                <span className="text-sm font-semibold text-white ml-auto">${cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <button 
            onClick={() => router.push('/transactions')}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{transaction.description}</div>
                    <div className="text-sm text-slate-400">{transaction.category}</div>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">No transactions yet</div>
              <button
                onClick={() => router.push('/transactions')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Add your first transaction →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
