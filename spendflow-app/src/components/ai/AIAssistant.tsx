'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { deepSeekService } from '@/lib/services/deepSeekService';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAnalysis {
  type: 'spending' | 'budget' | 'goals' | 'advice';
  title: string;
  action: () => Promise<string>;
}

export function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cachedWalletData, setCachedWalletData] = useState<{
    cards: any[];
    totalBalance: number;
    timestamp: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined AI analysis options
  const analysisOptions: AIAnalysis[] = [
    {
      type: 'wallet',
      title: '💳 Check My Wallet',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        // Check cache first (valid for 5 minutes)
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        let cards: any[];
        let totalBalance: number;

        if (cachedWalletData && (now - cachedWalletData.timestamp) < CACHE_DURATION) {
          cards = cachedWalletData.cards;
          totalBalance = cachedWalletData.totalBalance;
        } else {
          // Fetch fresh data
          cards = await cardsService.getByUserId(user.uid);
          totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

          // Cache the data
          setCachedWalletData({
            cards,
            totalBalance,
            timestamp: now
          });
        }

        if (cards.length === 0) {
          return deepSeekService!.getFinancialAdvice(
            'The user has no cards in their wallet. They should add some cards to track their finances.',
            { context: 'empty_wallet' }
          );
        }

        const walletSummary = cards.map(card => ({
          name: card.name,
          balance: card.balance,
          type: card.type,
          lastFour: card.lastFour || '****'
        }));

        return deepSeekService!.getFinancialAdvice(
          `Here's my current wallet status: Total balance across ${cards.length} cards: $${totalBalance.toFixed(2)}\n\nCard details: ${JSON.stringify(walletSummary)}\n\nPlease provide a summary of my wallet status and any financial insights.`,
          { context: 'wallet_check' }
        );
      }
    },
    {
      type: 'spending',
      title: '📊 Analyze My Spending',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        const [transactions, cards] = await Promise.all([
          transactionsService.getByUserId(user.uid),
          cardsService.getByUserId(user.uid)
        ]);

        return deepSeekService!.analyzeSpendingPatterns(transactions, {
          totalCards: cards.length,
          totalBalance: cards.reduce((sum, card) => sum + card.balance, 0),
        });
      }
    },
    {
      type: 'budget',
      title: '💰 Budget Recommendations',
      action: async () => {
        if (!user) throw new Error('User not authenticated');

        const transactions = await transactionsService.getByUserId(user.uid);

        // Estimate monthly income from positive transactions (deposits/income)
        const incomeTransactions = transactions.filter(t => t.amount > 0);
        let estimatedMonthlyIncome = 4000; // Default fallback

        if (incomeTransactions.length > 0) {
          const averageIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length;
          // If average income seems reasonable (> $500), use it
          if (averageIncome > 500) {
            estimatedMonthlyIncome = Math.round(averageIncome);
          }
        }

        return deepSeekService!.generateBudgetRecommendations(transactions, estimatedMonthlyIncome);
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
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant' as const,
        content: !deepSeekService
          ? `⚠️ **AI Service Not Configured**

The AI assistant requires a DeepSeek API key to function. To enable AI features:

1. Get an API key from [DeepSeek](https://platform.deepseek.com/)
2. Add it to your \`.env.local\` file as:
   \`NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here\`
3. Restart the development server

Once configured, you'll be able to:
• 💳 Check your wallet balances
• 📊 Analyze spending patterns  
• 💰 Get budget recommendations
• 🎯 Set savings goals
• 💬 Ask financial questions`
          : `👋 Hi! I'm your AI financial assistant. I can help you with:

• 💳 **Check My Wallet** - View your current balances across all cards
• 📊 **Analyze My Spending** - Understand your spending patterns and habits  
• 💰 **Budget Recommendations** - Get personalized budget plans based on your income
• 🎯 **Savings Goals Help** - Set and track realistic financial goals
• 💬 **General Financial Questions** - Ask me anything about money management

You can ask me general questions like:
"How do I start investing?" • "What's compound interest?" • "How to pay off credit card debt?" • "Best savings accounts?" • "Emergency fund tips?"

Click any button below or type your questions - I'll access your real financial data for personalized advice, or provide general guidance for any money topic!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, deepSeekService]);

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

      if (isWalletQuery && user) {
        // Check cache first for wallet data (valid for 5 minutes)
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        let cards: any[];
        let totalBalance: number;

        if (cachedWalletData && (now - cachedWalletData.timestamp) < CACHE_DURATION) {
          cards = cachedWalletData.cards;
          totalBalance = cachedWalletData.totalBalance;
        } else {
          // Fetch fresh data
          cards = await cardsService.getByUserId(user.uid);
          totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

          // Cache the data
          setCachedWalletData({
            cards,
            totalBalance,
            timestamp: now
          });
        }

        let contextMessage = input.trim(); // Use original message with proper casing

        if (cards.length === 0) {
          contextMessage += '\n\nNote: The user has no cards in their wallet. They should add some cards to track their finances.';
        } else {
          const walletSummary = cards.map(card => ({
            name: card.name,
            balance: card.balance,
            type: card.type,
            lastFour: card.lastFour || '****'
          }));

          contextMessage += `\n\nCurrent wallet status: Total balance across ${cards.length} cards: $${totalBalance.toFixed(2)}\n\nCard details: ${JSON.stringify(walletSummary)}`;
        }

        const response = await deepSeekService.getFinancialAdvice(contextMessage, {
          context: 'wallet_query',
          hasWalletData: cards.length > 0
        });
        addMessage('assistant', response);
      } else {
        // Regular financial advice for non-wallet queries
        const response = await deepSeekService.getFinancialAdvice(input.trim());
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
