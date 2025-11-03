import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { verifyIdToken } from '@/lib/firebase/admin';
import { transactionsService, cardsService } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // For now, skip authentication for demo purposes
    // TODO: Implement proper authentication
    const userId = 'demo-user';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'transactions', 'cards', 'summary'
    const limit = parseInt(searchParams.get('limit') || '100');
    const format = searchParams.get('format') || 'json'; // 'json', 'csv'

    let data;

    switch (type) {
      case 'transactions':
        data = await transactionsService.getRecentByUserId(userId, limit);
        break;

      case 'cards':
        data = await cardsService.getByUserId(userId);
        break;

      case 'summary':
        const [transactions, cards] = await Promise.all([
          transactionsService.getRecentByUserId(userId, 1000),
          cardsService.getByUserId(userId)
        ]);

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        data = {
          totalBalance: cards.reduce((sum, card) => sum + card.balance, 0),
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          totalTransactions: transactions.length,
          activeCards: cards.filter(c => c.isActive).length,
          totalCards: cards.length
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // Handle different response formats
    if (format === 'csv' && Array.isArray(data)) {
      const csvContent = convertToCSV(data);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="spendflow_data.csv"'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      userId
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle different data types
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}
