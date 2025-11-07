'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { deepSeekService } from '@/lib/services/deepSeekService';
import { useAuth } from '@/contexts/AuthContext';
import {
  transactionsService,
  cardsService,
  usersService,
  expensesService,
  incomeService,
  categoriesService
} from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAnalysis {
  type: 'wallet' | 'transactions' | 'spending' | 'budget' | 'goals' | 'advice';
  title: string;
  action: () => Promise<string>;
}

export function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    profile?: any;
    cards?: any[];
    transactions?: any[];
    expenses?: any[];
    income?: any[];
    categories?: any[];
    totalBalance?: number;
    monthlyIncome?: number;
    monthlyExpenses?: number;
    spendingByCategory?: Record<string, number>;
    transactionCount?: number;
    loadedAt?: Date;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      if (!deepSeekService) {
        addMessage('assistant', '⚠️ **AI Service Not Configured**\n\nThe AI assistant requires a DeepSeek API key to function. To enable AI features:\n\n1. Get an API key from [DeepSeek](https://platform.deepseek.com/)\n2. Add it to your `.env.local` file as:\n   `NEXT_PUBLIC_DEEPSEEK_API_KEY=your_key_here`\n3. Restart the development server\n\nOnce configured, I can help you with:\n• Financial analysis\n• Spending insights\n• Budget recommendations\n• Savings goals');
      } else if (loading) {
        addMessage('assistant', '🔄 **Loading your complete financial data...**\n\nI\'m accessing all your financial information from Firebase to provide personalized advice. This includes your cards, transactions, expenses, and income data.\n\n⏳ Please wait a moment while I load everything...');
      } else {
        addMessage('assistant', '👋 **Welcome to your AI Financial Assistant!**\n\nI\'m loading your complete financial profile... I can help you with:\n\n💳 Check your wallet and card balances\n📊 Analyze your spending patterns\n💰 Provide budget recommendations\n🎯 Help you set and achieve savings goals\n\nHow can I assist you today?');
      }
    }
  }, [messages.length, deepSeekService, loading]);

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
          categories
        ] = await Promise.all([
          usersService.get(user.uid),
          cardsService.getByUserId(user.uid),
          transactionsService.getByUserId(user.uid),
          expensesService.getActiveByUserId(user.uid),
          incomeService.getByUserId(user.uid),
          categoriesService.getAll()
        ]);

        // Calculate financial summaries
        const totalBalance = cards.reduce((sum, card) => {
          if (card.type === 'credit') {
            return sum + ((card.limit || 0) - card.balance);
          } else {
            return sum + card.balance;
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
            `Here's my current wallet status: Total balance across ${userData.cards.length} cards: $${userData.totalBalance?.toFixed(2)}\n\nCard details: ${JSON.stringify(walletSummary)}\n\nPlease provide a summary of my wallet status and any financial insights.`,
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
            transactionCount: userData.transactionCount
          };

          return deepSeekService!.analyzeSpendingPatterns([], {
            totalCards: userData.cards.length,
            totalBalance: userData.totalBalance || 0,
            precomputedSummary: spendingSummary
          });
        }

        return deepSeekService!.getFinancialAdvice(
          'I need more data to analyze your spending. Add some transactions first.',
          { context: 'insufficient_data' }
        );
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
          'I need income data to create budget recommendations. Add some income transactions first.',
          { context: 'insufficient_income_data' }
        );
      }
    },
    {
      type: 'goals',
      title: '🎯 Savings Goals Help',
      action: async () => {
        return deepSeekService!.getFinancialAdvice(
          'Help me set realistic savings goals based on my current financial situation.',
          { context: 'goal_setting' }
        );
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

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 1 && userData) {
      // Replace loading message with personalized welcome
      const personalizedMessage = {
        id: 'personalized-welcome',
        role: 'assistant' as const,
        content: `👋 **Hi ${userData.profile?.displayName || user?.displayName || 'User'}!** Welcome back to your AI Financial Assistant!

I have access to ALL your financial data:
• 💳 **${userData.cards?.length || 0} Cards** with total balance of **$${userData.totalBalance?.toFixed(2) || '0.00'}**
• 📊 **${userData.transactions?.length || 0} Transactions** analyzed
• 💰 **${userData.expenses?.length || 0} Recurring expenses** tracked
• 💵 **${userData.income?.length || 0} Income sources** monitored
• 📅 **Member since:** ${userData.profile?.createdAt ? new Date(userData.profile.createdAt).toLocaleDateString() : 'Recently'}

I can help you with:
• 💳 **"What's in my wallet?"** - Complete card details and balances
• 📊 **"What did I spend on?"** - Detailed transaction analysis
• 💰 **"How much did I spend this month?"** - Monthly spending breakdown
• 🎯 **"What are my biggest expenses?"** - Category spending analysis
• 📅 **"When do I have upcoming bills?"** - Recurring expenses schedule
• 💡 **"How can I save money?"** - Personalized budget recommendations
• 📈 **"What's my financial health?"** - Comprehensive financial assessment

**Try asking me questions like:**
• "What are my recent expenses?"
• "How much do I have in my wallet?"
• "What's my spending on food this month?"
• "Do I have any upcoming bills?"
• "What's my net worth?"

Click any button below or ask me anything - I have access to your complete financial universe!`,
        timestamp: new Date()
      };

      // Replace the loading message with personalized welcome
      setMessages([personalizedMessage]);
    }
  }, [messages.length, userData, deepSeekService]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!deepSeekService) {
      console.error('DeepSeek service not available');
      toast.error('AI service not configured. Please check your API key.');
      addMessage('assistant', '❌ AI service is not available. Please check that your NEXT_PUBLIC_DEEPSEEK_API_KEY is configured in your .env.local file.');
      return;
    }

    const userMessage = input.trim().toLowerCase();
    const originalMessage = input.trim(); // Store before clearing
    setInput('');
    setLoading(true);

    // Scroll to show the typing indicator immediately
    setTimeout(() => scrollToBottom(), 10);

    addMessage('user', originalMessage);

    try {
      // Check if the message is wallet-related and fetch data accordingly
      const walletKeywords = ['wallet', 'balance', 'money', 'account', 'card', 'cards', 'bank'];
      const isWalletQuery = walletKeywords.some(keyword => userMessage.includes(keyword));

      let contextMessage = input.trim();

      if (isWalletQuery && user) {
        // Use comprehensive user data
        if (userData?.cards && userData.cards.length > 0) {
          const walletSummary = userData.cards.map(card => ({
            name: card.name,
            balance: card.balance,
            type: card.type,
            lastFour: card.lastFour || '****'
          }));

          contextMessage += `\n\nCurrent wallet status: Total balance across ${userData.cards.length} cards: $${userData.totalBalance?.toFixed(2)}\nCard details: ${JSON.stringify(walletSummary)}`;

          const response = await deepSeekService.getFinancialAdvice(contextMessage, {
            context: 'wallet_query',
            hasWalletData: true
          });
          addMessage('assistant', response);
        } else {
          contextMessage += '\n\nNote: The user has no cards in their wallet. They should add some cards to track their finances.';

          const response = await deepSeekService.getFinancialAdvice(contextMessage, {
            context: 'wallet_query',
            hasWalletData: false
          });
          addMessage('assistant', response);
        }
      } else {
        // Always include comprehensive user context for personalized responses
        if (userData?.profile) {
          contextMessage += `\n\nUSER PROFILE: ${JSON.stringify(userData.profile)}`;
        }

        if (userData?.cards && userData.cards.length > 0) {
          const walletSummary = userData.cards.map(card => ({
            name: card.name,
            balance: card.balance,
            type: card.type,
            lastFour: card.lastFour || '****'
          }));
          contextMessage += `\n\nCURRENT WALLET: Total balance across ${userData.cards.length} cards: $${userData.totalBalance?.toFixed(2)}\nCard details: ${JSON.stringify(walletSummary)}`;
        }

        if (userData?.transactions && userData.transactions.length > 0) {
          const recentTransactions = userData.transactions.slice(0, 10).map(t => ({
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.date,
            type: t.type
          }));
          contextMessage += `\n\nRECENT TRANSACTIONS (last 10): ${JSON.stringify(recentTransactions)}`;
        }

        if (userData?.expenses && userData.expenses.length > 0) {
          const recurringExpenses = userData.expenses.map(e => ({
            name: e.name,
            amount: e.amount,
            category: e.category,
            dayOfMonth: e.dayOfMonth,
            isActive: e.isActive
          }));
          contextMessage += `\n\nRECURRING EXPENSES: ${JSON.stringify(recurringExpenses)}`;
        }

        if (userData?.income && userData.income.length > 0) {
          const incomeSources = userData.income.map(i => ({
            description: i.description,
            amount: i.amount,
            date: i.date
          }));
          contextMessage += `\n\nINCOME SOURCES: ${JSON.stringify(incomeSources)}`;
        }

        if (userData?.spendingByCategory) {
          contextMessage += `\n\nSPENDING BY CATEGORY: ${JSON.stringify(userData.spendingByCategory)}`;
        }

        if (userData?.monthlyIncome || userData?.monthlyExpenses) {
          contextMessage += `\n\nMONTHLY SUMMARY: Income: $${userData.monthlyIncome?.toFixed(2)}, Expenses: $${userData.monthlyExpenses?.toFixed(2)}`;
        }

        const response = await deepSeekService.getFinancialAdvice(contextMessage, {
          context: 'general_query',
          userName: userData?.profile?.displayName || user?.displayName,
          hasWalletData: !!(userData?.cards && userData.cards.length > 0),
          hasTransactionData: !!(userData?.transactions && userData.transactions.length > 0),
          hasExpenseData: !!(userData?.expenses && userData.expenses.length > 0),
          hasIncomeData: !!(userData?.income && userData.income.length > 0)
        });
        addMessage('assistant', response);
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      addMessage('assistant', 'Sorry, I\'m having trouble responding right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-serif text-slate-100">AI Financial Assistant</h2>
          <p className="text-sm text-slate-400">
            {!deepSeekService ? '⚠️ Service not configured' : 'Powered by SpendFlow'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {/* Loading/Typing Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-slate-400 text-sm ml-2">AI is analyzing your finances...</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Analysis Options (only show if no messages yet and service is available) */}
        {messages.length === 1 && deepSeekService && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Quick Analysis:</p>
            <div className="grid grid-cols-1 gap-2">
              {analysisOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleQuickAnalysis(option)}
                  disabled={loading}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg text-left transition-colors disabled:opacity-50"
                >
                  <p className="text-slate-200 font-medium">{option.title}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {option.type === 'wallet' && 'Check your current balances across all cards'}
                    {option.type === 'transactions' && 'Review your recent financial activity'}
                    {option.type === 'spending' && 'Analyze your spending patterns and habits'}
                    {option.type === 'budget' && 'Get personalized budget recommendations'}
                    {option.type === 'goals' && 'Help with setting and achieving savings goals'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={!deepSeekService ? "AI service not configured..." : "Ask me about your finances..."}
            disabled={loading || !deepSeekService}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:border-amber-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || !deepSeekService}
            className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {!deepSeekService ? "Configure API key to enable AI features" : "Press Enter to send • AI responses are for informational purposes only"}
        </p>
      </div>
    </div>
  );
}
