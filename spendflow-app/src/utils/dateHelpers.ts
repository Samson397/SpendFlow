/**
 * Date helper functions for filtering and grouping transactions
 */

/**
 * Get the start and end dates for the current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the start and end dates for a specific month
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the start and end dates for the previous month
 */
export function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  return getMonthRange(year, month);
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && 
         date.getMonth() === now.getMonth();
}

/**
 * Check if a date is in a specific month
 */
export function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Format month for display (e.g., "January 2025")
 */
export function formatMonth(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get list of recent months for dropdown
 */
export function getRecentMonths(count: number = 12): Array<{ year: number; month: number; label: string }> {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: formatMonth(date.getFullYear(), date.getMonth())
    });
  }
  
  return months;
}

/**
 * Group transactions by month
 */
export function groupTransactionsByMonth<T extends { date: Date }>(
  transactions: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  transactions.forEach(transaction => {
    const key = `${transaction.date.getFullYear()}-${transaction.date.getMonth()}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(transaction);
  });
  
  return grouped;
}

/**
 * Filter transactions for current month
 */
export function filterCurrentMonth<T extends { date: Date }>(transactions: T[]): T[] {
  const { start, end } = getCurrentMonthRange();
  return transactions.filter(t => t.date >= start && t.date <= end);
}

/**
 * Filter transactions for specific month
 */
export function filterByMonth<T extends { date: Date }>(
  transactions: T[], 
  year: number, 
  month: number
): T[] {
  const { start, end } = getMonthRange(year, month);
  return transactions.filter(t => t.date >= start && t.date <= end);
}
