/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format a date to a readable string
 * @param date - The date to format (Date object or string)
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number, 
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Generate a random string of specified length
 * @param length - The length of the string to generate (default: 8)
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Truncate a string to a specified length
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @param ellipsis - Whether to add an ellipsis (...) at the end (default: true)
 * @returns Truncated string
 */
export function truncateString(
  str: string, 
  maxLength: number, 
  ellipsis: boolean = true
): string {
  if (str.length <= maxLength) return str;
  return ellipsis 
    ? `${str.substring(0, maxLength)}...` 
    : str.substring(0, maxLength);
}

/**
 * Format a number as a percentage
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number, 
  decimals: number = 2
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas as thousand separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(
  bytes: number, 
  decimals: number = 2
): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
