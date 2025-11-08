'use client';

import { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { deepSeekService, testDeepSeekConnection } from '@/lib/services/deepSeekService';
import { useAuth } from '@/contexts/AuthContext';
import { BudgetService } from '@/lib/services/budgetService';
import { Budget } from '@/types/budget';
import {
  transactionsService,
  cardsService,
  usersService,
  expensesService,
  incomeService,
  categoriesService
} from '@/lib/firebase/firestore';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAnalysis {
  type: 'wallet' | 'trends' | 'predictive' | 'goals' | 'budget' | 'scenarios' | 'transactions' | 'spending' | 'advice';
  title: string;
  action: () => Promise<string>;
}

export function AIAssistant() {
  const { user } = useAuth();
  const { formatAmount, currency } = useCurrency();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    profile?: any;
    cards?: any[];
    transactions?: any[];
    expenses?: any[];
    income?: any[];
    categories?: any[];
    budgets?: Budget[];
    totalBalance?: number;
    monthlyIncome?: number;
    monthlyExpenses?: number;
    spendingByCategory?: Record<string, number>;
    transactionCount?: number;
    loadedAt?: Date;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      if (!deepSeekService) {
        addMessage('assistant', '❌ **AI Service Not Available**\n\nTo enable AI financial analysis:\n\n1. **Get API Key**: Visit [DeepSeek Platform](https://platform.deepseek.com/) and create an account\n2. **Generate Key**: Go to API Keys section and create a new key\n3. **Configure**: Copy your API key and replace `sk-your_actual_api_key_here_from_deepseek_platform` in your `.env.local` file\n4. **Restart**: Restart your development server\n\n**Example .env.local entry:**\n```\nNEXT_PUBLIC_DEEPSEEK_API_KEY=sk-abc123def456ghi789...\n```\n\nOnce configured, I can provide personalized financial insights with real data analysis!');
      } else {
        addMessage('assistant', '👋 **Welcome to your AI Financial Assistant!**\n\nI\'m ready to analyze your finances. Click any action on the left to get started, or ask me a direct question below.\n\nI have access to your complete financial data and can provide specific insights with real numbers.');
      }
    }
  }, []);

  // Handle service state changes (only update if we have exactly 1 message and it's the initial one)
  useEffect(() => {
    if (messages.length === 1 && messages[0].content.includes('AI Service Not Configured') && deepSeekService) {
      // Service was configured after initial load, update the message
      setMessages([{
        id: `service-configured-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: loading
          ? '🔄 **Loading your complete financial data...**\n\nI\'m accessing all your financial information from Firebase to provide personalized advice. This includes your cards, transactions, expenses, and income data.\n\n⏳ Please wait a moment while I load everything...'
          : '👋 **Welcome to your AI Financial Assistant!**\n\nI\'m loading your complete financial profile... I can help you with:\n\n💳 Check your wallet and card balances\n📊 Analyze your spending patterns\n💰 Provide budget recommendations\n🎯 Help you set and achieve savings goals\n\nHow can I assist you today?',
        timestamp: new Date()
      }]);
    }
  }, [deepSeekService, loading, messages.length]); // Only depend on service state, not messages content

  // Load comprehensive user data from ALL collections
  useEffect(() => {
    const loadAllUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Load ALL user data from all collections simultaneously
        const [
          profile,
          cards,
          transactions,
          expenses,
          income,
          categories,
          budgets
        ] = await Promise.all([
          usersService.get(user.uid),
          cardsService.getByUserId(user.uid),
          transactionsService.getByUserId(user.uid),
          expensesService.getActiveByUserId(user.uid),
          incomeService.getByUserId(user.uid),
          categoriesService.getAll(),
          BudgetService.getByUserId(user.uid)
        ]);

        // Calculate financial summaries
        const totalBalance = cards.reduce((sum, card) => {
          if (card.type === 'credit') {
            // Credit cards: balance = available credit remaining
            // Amount owed = credit limit - available credit
            const creditLimit = card.creditLimit || card.limit || 0;
            const amountOwed = creditLimit - (card.balance || 0);
            return sum - amountOwed; // Subtract the debt/liability
          } else {
            // Debit/savings cards: balance = money they have (asset)
            return sum + (card.balance || 0);
          }
        }, 0);

        const monthlyIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const spendingByCategory: Record<string, number> = {};
        transactions.forEach(t => {
          if (t.type === 'expense') {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
          }
        });

        const comprehensiveUserData = {
          profile,
          cards,
          transactions,
          expenses,
          income,
          categories,
          budgets,
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          spendingByCategory,
          transactionCount: transactions.length,
          loadedAt: new Date()
        };

        setUserData(comprehensiveUserData);

      } catch (error) {
        console.error('Error loading comprehensive user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllUserData();
  }, [user]);

  // Predefined AI analysis options
  const analysisOptions: AIAnalysis[] = [
    {
      type: 'wallet',
      title: '💳 Check My Wallet',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        // Use comprehensive user data
        if (userData?.cards && userData.cards.length > 0) {
          const walletSummary = userData.cards.map(card => ({
            name: card.name,
            balance: card.balance,
            type: card.type,
            lastFour: card.lastFour || '****'
          }));

          return deepSeekService!.getFinancialAdvice(
            `Here's my current wallet status in ${currency.code}: Total balance across ${userData.cards.length} cards: ${formatAmount(userData.totalBalance || 0)}\n\nCard details: ${JSON.stringify(walletSummary)}\n\nPlease provide a summary of my wallet status and any financial insights. Show all amounts in ${currency.code}.`,
            { context: 'wallet_check' }
          );
        }

        return deepSeekService!.getFinancialAdvice(
          'You don\'t have any cards in your wallet yet. Add some cards to start tracking your finances.',
          { context: 'empty_wallet' }
        );
      }
    },
    {
      type: 'transactions',
      title: '📊 Recent Transactions',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        // Use comprehensive user data
        if (userData?.transactions && userData.transactions.length > 0) {
          const recentTransactions = userData.transactions.slice(0, 10).map(t => ({
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.date,
            type: t.type
          }));

          return deepSeekService!.getFinancialAdvice(
            `Here are my recent transactions: ${JSON.stringify(recentTransactions)}\n\nPlease analyze my spending patterns and provide insights about my financial habits.`,
            { context: 'transaction_analysis' }
          );
        }

        return deepSeekService!.getFinancialAdvice(
          'You haven\'t made any transactions yet. Start by adding some income or expenses to track your finances.',
          { context: 'no_transactions' }
        );
      }
    },
    {
      type: 'spending',
      title: '📊 Analyze My Spending',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        // Use comprehensive user data
        if (userData?.transactions && userData?.cards) {
          const spendingSummary = {
            totalIncome: userData.monthlyIncome,
            totalExpenses: userData.monthlyExpenses,
            spendingByCategory: userData.spendingByCategory,
            totalBalance: userData.totalBalance,
            transactionCount: userData.transactionCount,
            currency: currency.code
          };

          return deepSeekService!.analyzeSpendingPatterns([], {
            totalCards: userData.cards.length,
            totalBalance: userData.totalBalance || 0,
            precomputedSummary: spendingSummary,
            currency: currency.code,
            formatAmount: formatAmount
          });
        }

        return deepSeekService!.getFinancialAdvice(
          'I need more data to analyze your spending. Add some transactions first.',
          { context: 'insufficient_data' }
        );
      }
    },
    {
      type: 'trends',
      title: '📈 Spending Trends',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        if (userData?.transactions && userData.transactions.length > 0) {
          return deepSeekService!.analyzeSpendingTrends(userData.transactions, 6);
        }

        return 'I need more transaction data to analyze your spending trends. Please add some transactions first.';
      }
    },
    {
      type: 'predictive',
      title: '🔮 Financial Forecast',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        if (userData?.transactions && userData?.budgets && userData?.profile) {
          return deepSeekService!.predictFinancialHealth(
            userData.transactions,
            userData.budgets,
            userData.profile
          );
        }

        return 'I need more financial data to provide accurate predictions. Please add transactions and budgets first.';
      }
    },
    {
      type: 'goals',
      title: '🎯 Financial Goals',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        if (userData?.transactions && userData?.monthlyIncome) {
          return deepSeekService!.createFinancialGoals(
            userData.transactions,
            userData.totalBalance || 0,
            userData.monthlyIncome
          );
        }

        return 'I need income data to create personalized goals. Please add some income transactions first.';
      }
    },
    {
      type: 'budget',
      title: '💰 Budget Recommendations',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        // Use comprehensive user data
        if (userData?.transactions && userData?.monthlyIncome) {
          return deepSeekService!.generateBudgetRecommendations([], userData.monthlyIncome);
        }

        return deepSeekService!.getFinancialAdvice(
          'I need income data to create budget recommendations. Please add some income transactions first.',
          { context: 'insufficient_income_data' }
        );
      }
    },
    {
      type: 'scenarios',
      title: '🔀 Scenario Analysis',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        const scenarios = [
          "What if I cut dining out by 50%?",
          "What if I increase my savings rate to 25%?",
          "What if I get a 10% raise?",
          "What if my rent increases by $200?"
        ];

        const currentSituation = {
          monthlyIncome: userData?.monthlyIncome || 0,
          monthlyExpenses: userData?.monthlyExpenses || 0,
          totalBalance: userData?.totalBalance || 0,
          activeBudgets: userData?.budgets?.length || 0,
          spendingByCategory: userData?.spendingByCategory || {}
        };

        return deepSeekService!.analyzeFinancialScenarios(currentSituation, scenarios);
      }
    }
  ];

  const scrollToBottom = () => {
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      // Always scroll to bottom for new messages, but with a slight delay to ensure DOM update
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleQuickAnalysis = async (analysis: AIAnalysis) => {
    if (!deepSeekService) {
      toast.error('AI service not available. Please check your configuration.');
      addMessage('assistant', '❌ AI service is not available. Please check your API key configuration and try again.');
      return;
    }

    if (!user) {
      toast.error('Please log in to use AI analysis features.');
      addMessage('assistant', '❌ You must be logged in to use AI analysis features.');
      return;
    }

    setLoading(true);
    addMessage('user', `📊 ${analysis.title}`);

    // Scroll to show the typing indicator immediately
    setTimeout(() => scrollToBottom(), 10);

    try {
      const result = await analysis.action();
      addMessage('assistant', result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addMessage('assistant', `❌ Sorry, I encountered an error analyzing your data: ${errorMessage}. Please try again later.`);
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPIKey = async () => {
    setLoading(true);
    try {
      const result = await testDeepSeekConnection();
      if (result.success) {
        addMessage('assistant', '✅ **API Key Test Successful!**\n\nYour DeepSeek API key is working correctly. The AI assistant is now fully functional!\n\nYou can now:\n• Click any analysis button on the left\n• Get personalized financial insights\n\nTry clicking "Check My Wallet" or any other analysis option.');
      } else {
        addMessage('assistant', `❌ **API Key Test Failed**\n\n${result.message}\n\n**Troubleshooting:**\n• Make sure your API key starts with \`sk-\`\n• Check that it's not truncated or incomplete\n• Verify you have credits/quota remaining\n• Try getting a fresh API key from DeepSeek\n\nCurrent key format check: API keys should be ~100+ characters long.`);
      }
    } catch (error) {
      addMessage('assistant', `❌ **Test Error**\n\nAn unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-900">
      {/* Left Sidebar - Quick Actions */}
      <div className="w-80 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
            <Lucide.Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-serif text-slate-100">AI Assistant</h2>
            <p className="text-sm text-slate-400">Quick Actions</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-slate-200 font-medium text-sm tracking-wider uppercase">Financial Analysis</h3>
            <div className="grid grid-cols-1 gap-2">
              {analysisOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleQuickAnalysis(option)}
                  disabled={loading}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 rounded-lg text-left transition-all disabled:opacity-50 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg mt-0.5">{option.title.split(' ')[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-medium text-sm group-hover:text-amber-400 transition-colors">
                        {option.title.replace(/^[^\s]+\s/, '')}
                      </p>
                      <p className="text-slate-400 text-xs mt-1 leading-tight">
                        {option.type === 'wallet' && 'Check balances & totals'}
                        {option.type === 'transactions' && 'Recent activity analysis'}
                        {option.type === 'spending' && 'Spending patterns & insights'}
                        {option.type === 'trends' && 'Month-over-month changes'}
                        {option.type === 'predictive' && '3-month financial forecast'}
                        {option.type === 'goals' && 'Personalized goal setting'}
                        {option.type === 'budget' && 'Budget recommendations'}
                        {option.type === 'scenarios' && 'What-if scenario analysis'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-3">
            <div className="text-center">
              <p className="text-slate-400 text-xs">💡 Click any analysis button above to get AI insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - AI Response Area */}
      <div className="flex-1 flex flex-col">
        {/* Response Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif text-slate-100">AI Analysis</h3>
              <p className="text-sm text-slate-400">
                {!deepSeekService ? '⚠️ Service not configured' : 'Click any action to get insights'}
              </p>
            </div>
            {messages.length > 1 && (
              <button
                onClick={() => setMessages([messages[0]])}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Response Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lucide.Bot className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-serif text-slate-100 mb-2">AI Financial Assistant</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {!deepSeekService
                    ? "Configure your DeepSeek API key to unlock AI-powered financial insights and personalized recommendations."
                    : "Select an action from the sidebar to get personalized financial insights and recommendations. I analyze your complete financial data to provide specific, actionable advice."
                  }
                </p>
                {!deepSeekService && (
                  <button
                    onClick={handleTestAPIKey}
                    disabled={loading}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Testing...' : 'Test API Key'}
                  </button>
                )}
                {deepSeekService && (
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-4">Choose from the quick actions on the left →</p>
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <Lucide.ArrowLeft className="h-4 w-4" />
                      <span className="text-xs tracking-wider uppercase">Click any button to get started</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              {/* Show only the latest AI response */}
              {messages.slice(-1).map((message) => (
                <div key={message.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Lucide.Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 mb-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {loading && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Lucide.Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-6 h-6">
                          <div className="absolute inset-0 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span className="text-slate-400 text-sm">Analyzing your finances...</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="loading-shimmer h-full rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
