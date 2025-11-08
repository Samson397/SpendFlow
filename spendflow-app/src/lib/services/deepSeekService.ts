/**
 * DeepSeek AI Service for SpendFlow
 * Provides AI-powered financial analysis and insights
 */

interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';
  private responseCache = new Map<string, { response: string; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepSeekMessage[], options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    stream?: boolean;
  } = {}): Promise<string> {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'deepseek-chat',
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('No response from DeepSeek API');
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      throw error;
    }
  }

  private getCacheKey(messages: DeepSeekMessage[], options: any): string {
    const keyData = {
      messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) })),
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    };
    return btoa(JSON.stringify(keyData)).substring(0, 50);
  }

  private getCachedResponse(cacheKey: string): string | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    this.responseCache.delete(cacheKey);
    return null;
  }

  private cacheResponse(cacheKey: string, response: string): void {
    this.responseCache.set(cacheKey, { response, timestamp: Date.now() });

    // Clean up old cache entries
    if (this.responseCache.size > 50) {
      const oldestKey = Array.from(this.responseCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.responseCache.delete(oldestKey);
    }
  }

  /**
   * Analyze user spending patterns
   */
  async analyzeSpendingPatterns(transactions: any[], userProfile: any): Promise<string> {
    const systemPrompt = `You are a direct financial analyst. Give straight answers about spending patterns with specific details and actionable insights. Skip introductions and get to the key points. Be conversational but informative. Use the provided currency format for all amounts.`;

    const spendingData = transactions.map(t => ({
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
    }));

    const userMessage = `Analyze my spending: ${JSON.stringify(spendingData.slice(0, 20))}. User profile: ${JSON.stringify(userProfile)}. Tell me exactly what's happening with my money and what I should do about it. Format all monetary amounts using the user's currency (don't use generic $ symbols).`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.3, maxTokens: 600 });
  }

  /**
   * Categorize a transaction description
   */
  async categorizeTransaction(description: string, amount: number): Promise<string> {
    const systemPrompt = `You are a transaction categorization expert.
    Categorize financial transactions into standard categories like:
    Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities,
    Healthcare, Education, Travel, Business, Income, etc.

    Return only the category name, nothing else.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Categorize this transaction: "${description}" ($${amount})` }
    ];

    const result = await this.chat(messages, { temperature: 0.1, maxTokens: 50 });
    return result.trim();
  }

  /**
   * Generate budget recommendations
   */
  async generateBudgetRecommendations(transactions: any[], income: number): Promise<string> {
    const systemPrompt = `You are a practical budget advisor. Give direct budget recommendations based on actual spending data. Be specific about amounts and realistic. Skip fluffy language. Use the provided currency format for all monetary amounts.`;

    const spendingSummary = transactions.reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const userMessage = `My monthly income is $${income}. My spending by category: ${JSON.stringify(spendingSummary)}. Give me a realistic budget plan with specific amounts for each category. What should I cut back on and how much can I save? Use proper currency formatting for all amounts.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.2, maxTokens: 800 });
  }

  /**
   * Analyze spending trends over time
   */
  async analyzeSpendingTrends(transactions: any[], months: number = 6): Promise<string> {
    const systemPrompt = `You are a direct trend analyst. Give straight answers about spending changes over time. Be specific about amounts and percentages. Skip introductions. Use proper currency formatting for all monetary amounts.`;

    // Group transactions by month
    const monthlyData = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, categories: {} };
      }

      acc[monthKey].total += Math.abs(t.amount);
      acc[monthKey].categories[t.category || 'Other'] =
        (acc[monthKey].categories[t.category || 'Other'] || 0) + Math.abs(t.amount);

      return acc;
    }, {} as Record<string, { total: number; categories: Record<string, number> }>);

    const userMessage = `Look at my spending over ${months} months: ${JSON.stringify(monthlyData)}. What's actually changing? Which categories are going up or down and by how much? Give me the real numbers with proper currency formatting.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.3, maxTokens: 600 });
  }

  /**
   * Provide predictive financial insights
   */
  async predictFinancialHealth(transactions: any[], budgets: any[], userProfile: any): Promise<string> {
    const systemPrompt = `You are a direct financial forecaster. Give straight predictions about financial future based on current data. Be specific about timeframes and amounts. Skip introductions. Use proper currency formatting for all monetary amounts.`;

    const recentTransactions = transactions.slice(0, 50); // Last 50 transactions
    const activeBudgets = budgets.filter(b => b.isActive);

    const userMessage = `Based on my recent activity: ${JSON.stringify(recentTransactions)}, budgets: ${JSON.stringify(activeBudgets)}, and profile: ${JSON.stringify(userProfile)}, what's going to happen to my money in the next 3 months? Be specific about amounts and risks. Use proper currency formatting.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.4, maxTokens: 800 });
  }

  /**
   * Generate personalized financial goals and tracking
   */
  async createFinancialGoals(transactions: any[], currentSavings: number, monthlyIncome: number): Promise<string> {
    const systemPrompt = `You are a practical goal-setting advisor. Give specific, achievable financial goals with exact amounts and timelines. Be realistic and actionable. Skip fluffy language. Use proper currency formatting for all monetary amounts.`;

    const monthlySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const userMessage = `I earn $${monthlyIncome} monthly, spend $${monthlySpending}, and have $${currentSavings} saved. Recent spending: ${JSON.stringify(transactions.slice(0, 20))}. Give me 3 specific goals I can actually achieve with exact amounts and deadlines. Use proper currency formatting.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.3, maxTokens: 700 });
  }

  /**
   * Generate scenario analysis for financial decisions
   */
  async analyzeFinancialScenarios(currentSituation: any, scenarios: string[]): Promise<string> {
    const systemPrompt = `You are a direct scenario analyst. Give straight answers about financial outcomes. Be specific about amounts and timeframes. Skip introductions and fluff. Use proper currency formatting for all monetary amounts.`;

    const userMessage = `My current financial situation: ${JSON.stringify(currentSituation)}. Analyze these scenarios and tell me exactly what would happen to my money: ${scenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}. Give specific numbers and realistic outcomes. Use proper currency formatting.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.4, maxTokens: 1000 });
  }

  /**
   * Provide daily financial tips and insights
   */
  async getDailyFinancialTip(userProfile: any, recentActivity: any[]): Promise<string> {
    const systemPrompt = `You are a direct financial coach. Give one practical, actionable tip with specific steps. Be conversational and encouraging. Keep it under 100 words.`;

    const userMessage = `Based on my profile: ${JSON.stringify(userProfile)} and recent activity: ${JSON.stringify(recentActivity.slice(0, 5))}, give me one specific financial tip I can implement today. Make it actionable and realistic.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.6, maxTokens: 200 });
  }

  /**
   * Get financial advice (optimized for speed with caching)
   */
  async getFinancialAdvice(question: string, context?: any): Promise<string> {
    const systemPrompt = `You are a direct financial advisor. Give straight, practical answers with specific details. Be conversational but informative. Skip introductions and get to the point. Use simple language.`;

    let userMessage = question;
    if (context) {
      userMessage += `\n\nContext: ${JSON.stringify(context)}`;
    }

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const options = {
      temperature: 0.3,
      maxTokens: 300, // Increased for more details
      model: 'deepseek-chat',
      stream: false
    };

    // Check cache first
    const cacheKey = this.getCacheKey(messages, options);
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.chat(messages, options);

    // Cache the response
    this.cacheResponse(cacheKey, response);

    return response;
  }
}

// Export singleton instance (will be initialized with API key)
export let deepSeekService: DeepSeekService | null = null;

export function initializeDeepSeek(apiKey: string) {
  deepSeekService = new DeepSeekService(apiKey);
}

/**
 * Test function to validate API key
 */
export async function testDeepSeekConnection(): Promise<{ success: boolean; message: string }> {
  if (!deepSeekService) {
    return { success: false, message: 'Service not initialized' };
  }

  try {
    // Make a simple test request
    const testMessage = 'Hello, this is a test message. Please respond with just "OK" if you can read this.';
    const response = await deepSeekService.chat(
      [{ role: 'user', content: testMessage }],
      { temperature: 0, maxTokens: 10 }
    );

    if (response && response.toLowerCase().includes('ok')) {
      return { success: true, message: 'API key is valid and working' };
    } else {
      return { success: false, message: 'API key responded but with unexpected content' };
    }
  } catch (error) {
    console.error('DeepSeek test failed:', error);
    return {
      success: false,
      message: `API key test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
