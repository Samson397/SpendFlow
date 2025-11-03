/**
 * Check if a card's expiry date has passed
 */
export function isCardExpired(expiryDate: string): boolean {
  if (!expiryDate || !expiryDate.includes('/')) {
    return false;
  }

  const [month, year] = expiryDate.split('/').map(num => parseInt(num, 10));

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return false;
  }

  // Convert 2-digit year to 4-digit year (assuming 20xx for years < 50, 19xx for years >= 50)
  const fullYear = year < 50 ? 2000 + year : 1900 + year;

  const expiryDateTime = new Date(fullYear, month - 1); // month is 0-indexed in Date
  const now = new Date();

  // Set expiry to end of the expiry month
  expiryDateTime.setMonth(expiryDateTime.getMonth() + 1, 0);
  expiryDateTime.setHours(23, 59, 59, 999);

  return now > expiryDateTime;
}

/**
 * Get expiry status information
 */
export function getCardExpiryStatus(expiryDate: string): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
} {
  if (!expiryDate || !expiryDate.includes('/')) {
    return { isExpired: false, isExpiringSoon: false, daysUntilExpiry: Infinity };
  }

  const [month, year] = expiryDate.split('/').map(num => parseInt(num, 10));

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return { isExpired: false, isExpiringSoon: false, daysUntilExpiry: Infinity };
  }

  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  const expiryDateTime = new Date(fullYear, month - 1);
  expiryDateTime.setMonth(expiryDateTime.getMonth() + 1, 0); // End of expiry month
  expiryDateTime.setHours(23, 59, 59, 999);

  const now = new Date();
  const timeDiff = expiryDateTime.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 30; // Expiring within 30 days

  return { isExpired, isExpiringSoon, daysUntilExpiry };
}
