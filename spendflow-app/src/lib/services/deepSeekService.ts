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
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepSeekMessage[], options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}): Promise<string> {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'deepseek-chat'
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
          stream: false,
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

  /**
   * Analyze user spending patterns
   */
  async analyzeSpendingPatterns(transactions: any[], userProfile: any): Promise<string> {
    const systemPrompt = `You are a financial advisor AI analyzing spending patterns.
    Provide insights about spending habits, identify potential savings opportunities,
    and give personalized financial advice. Be helpful, encouraging, and specific.`;

    const spendingData = transactions.map(t => ({
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
    }));

    const userMessage = `Analyze my spending patterns and provide insights:

User Profile: ${JSON.stringify(userProfile)}
Recent Transactions: ${JSON.stringify(spendingData.slice(0, 20))}

Please provide:
1. Spending pattern analysis
2. Areas for potential savings
3. Personalized financial advice
4. Budget recommendations`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.3, maxTokens: 800 });
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
    const systemPrompt = `You are a budgeting expert. Create personalized budget recommendations
    based on spending history and income. Suggest realistic budget allocations using the 50/30/20 rule
    (50% needs, 30% wants, 20% savings) or similar frameworks.`;

    const spendingSummary = transactions.reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const userMessage = `Create a budget plan for someone with monthly income of $${income}.

Spending breakdown: ${JSON.stringify(spendingSummary)}

Please provide:
1. Budget allocation recommendations
2. Areas to cut back or increase
3. Savings goals
4. Monthly spending limits by category`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, { temperature: 0.2, maxTokens: 1000 });
  }

  /**
   * Get financial advice (optimized for speed)
   */
  async getFinancialAdvice(question: string, context?: any): Promise<string> {
    const systemPrompt = `You are a knowledgeable financial advisor AI.
    Provide helpful, accurate financial advice. Be helpful, encouraging, and specific.
    Keep responses concise and actionable. Always suggest consulting professionals for complex decisions.`;

    let userMessage = question;
    if (context) {
      userMessage += `\n\nContext: ${JSON.stringify(context)}`;
    }

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Use faster model and shorter responses for wallet queries
    const isWalletQuery = context?.context === 'wallet_query';
    const options = isWalletQuery ? {
      temperature: 0.3,
      maxTokens: 300, // Shorter responses for wallet queries
      model: 'deepseek-chat'
    } : {
      temperature: 0.4,
      maxTokens: 400, // Moderate length for general queries
      model: 'deepseek-chat'
    };

    return this.chat(messages, options);
  }
}

// Export singleton instance (will be initialized with API key)
export let deepSeekService: DeepSeekService | null = null;

export function initializeDeepSeek(apiKey: string) {
  deepSeekService = new DeepSeekService(apiKey);
}
