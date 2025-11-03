'use client';

import { useState, useEffect } from 'react';
import AdBanner from '@/components/ads/AdBanner';

// Define types
interface Transaction {
  id: number;
  name: string;
  amount: string;
  date: string;
  category: string;
  description?: string;
  type?: string;
}

interface Ad {
  id: string;
  isAd: true;
}

type ContentItem = Transaction | Ad;

// Mock transaction data
const generateMockTransactions = (count: number): Transaction[] => {
  const categories = ['Food', 'Shopping', 'Bills', 'Transportation', 'Entertainment'];
  const names = ['Grocery Store', 'Coffee Shop', 'Restaurant', 'Online Shopping', 'Gas Station', 'Utility Bill', 'Phone Bill', 'Entertainment'];
  const types = ['expense', 'income'];
  
  return Array(count).fill(null).map((_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    description: `Transaction ${i + 1}`,
    amount: `$${(Math.random() * 200 + 5).toFixed(2)}`,
    type: types[Math.floor(Math.random() * types.length)],
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
};

export default function AdsDemoPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load mock data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setTransactions(generateMockTransactions(8));
      setLoading(false);
    }, 800);

    // Cleanup function
    return () => clearTimeout(timer);
  }, []);


  // Insert ad after every 3 transactions
  const contentWithAds: ContentItem[] = [];
  transactions.forEach((tx, index) => {
    contentWithAds.push(tx);
    if ((index + 1) % 3 === 0) {
      contentWithAds.push({ isAd: true, id: `ad-${index}` });
    }
  });

  // Add one more ad at the end if needed
  const lastItem = contentWithAds[contentWithAds.length - 1];
  if (contentWithAds.length > 0 && !('isAd' in lastItem && lastItem.isAd)) {
    contentWithAds.push({ isAd: true, id: 'ad-end' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean and ad-free */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">SpendFlow</h1>
            <nav className="hidden md:flex space-x-1">
              {['dashboard', 'transactions', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'transactions' && 'Recent Transactions'}
            {activeTab === 'reports' && 'Spending Reports'}
          </h1>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Transaction
            </button>
            <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Cards */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { title: 'Total Balance', amount: '$12,345', change: '+2.4%', trend: 'up' },
                  { title: 'Income', amount: '$4,230', change: '+5.1%', trend: 'up' },
                  { title: 'Expenses', amount: '$2,845', change: '-1.2%', trend: 'down' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.amount}</p>
                      <span className={`ml-2 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transaction List with In-Content Ads */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['All', 'Income', 'Expenses', 'Transfers'].map((tab) => (
                    <button
                      key={tab}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        tab === 'All'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Transaction List */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
                    <p className="mt-2 text-gray-500">Loading transactions...</p>
                  </div>
                ) : contentWithAds.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new transaction.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        New Transaction
                      </button>
                    </div>
                  </div>
                ) : (
                  contentWithAds.map((item, index) =>
                    'isAd' in item && item.isAd ? (
                      <div key={item.id} className="p-4 bg-gray-50 border-t border-b border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Advertisement</div>
                        <AdBanner size="medium" className="mx-auto" />
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {(item as Transaction).name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{(item as Transaction).name}</div>
                            <div className="text-sm text-gray-500">{(item as Transaction).category}</div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm font-medium text-gray-900">{(item as Transaction).amount}</div>
                          <div className="text-xs text-gray-500">{(item as Transaction).date}</div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Bottom Ad - Only on mobile */}
            <div className="lg:hidden mt-6">
              <div className="text-xs text-gray-500 mb-2">Advertisement</div>
              <AdBanner size="large" className="mx-auto" />
            </div>
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="lg:w-80 space-y-6 hidden lg:block">
            {/* Budget Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Monthly Budget</h3>
              <div className="space-y-4">
                {[
                  { name: 'Groceries', progress: 65, color: 'bg-blue-500' },
                  { name: 'Dining Out', progress: 85, color: 'bg-green-500' },
                  { name: 'Entertainment', progress: 45, color: 'bg-yellow-500' },
                  { name: 'Shopping', progress: 30, color: 'bg-purple-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{item.name}</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <div>
              <div className="text-xs text-gray-500 mb-2">Advertisement</div>
              <AdBanner size="small" className="!w-full !h-[250px]" />
            </div>

            {/* Recent Categories */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Spending by Category</h3>
              <div className="space-y-3">
                {[
                  { name: 'Food & Dining', amount: '$845', percentage: 35 },
                  { name: 'Shopping', amount: '$560', percentage: 23 },
                  { name: 'Bills', amount: '$320', percentage: 13 },
                  { name: 'Transportation', amount: '$275', percentage: 11 },
                  { name: 'Entertainment', amount: '$180', percentage: 7 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.amount} • {item.percentage}%</div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Banner Ad - Desktop only */}
      <div className="hidden lg:block bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Advertisement</div>
            <AdBanner size="large" className="mx-auto" />
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SpendFlow. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy</span>
                <span className="text-sm">Privacy Policy</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms</span>
                <span className="text-sm">Terms of Service</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                <span className="text-sm">Contact Us</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
