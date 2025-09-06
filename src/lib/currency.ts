/**
 * Format number to Thai Baht currency
 * @param amount - Amount in THB
 * @param showCurrency - Whether to show ฿ symbol
 * @returns Formatted currency string
 */
export function formatTHB(amount: number, showCurrency = true): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return showCurrency ? '฿0.00' : '0.00';
  }

  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const prefix = showCurrency ? '฿' : '';
  return amount < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Format large numbers with abbreviations (e.g., ฿1.2M)
 * @param amount - Amount in THB
 * @returns Formatted currency string with abbreviations
 */
export function formatTHBCompact(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '฿0.00';
  }

  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    const millions = amount / 1000000;
    return `฿${millions.toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    const thousands = amount / 1000;
    return `฿${thousands.toFixed(1)}K`;
  }
  
  return formatTHB(amount);
}

/**
 * Parse Thai Baht string to number
 * @param value - Currency string (with or without ฿)
 * @returns Parsed number
 */
export function parseTHB(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove ฿ symbol, spaces, and commas
  const cleanValue = value.replace(/[฿,\s]/g, '').trim();
  if (!cleanValue) return 0;
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate THB amount
 * @param amount - Amount to validate
 * @returns Boolean indicating if amount is valid
 */
export function isValidTHBAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
}

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  THB: '฿',
  USDT: '$',
  MMK: 'K'
} as const;

// Currency names mapping
const CURRENCY_NAMES = {
  THB: 'Thai Baht',
  USDT: 'Tether USD',
  MMK: 'Myanmar Kyat'
} as const;

/**
 * Format number with currency symbol
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param showCurrency - Whether to show currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: 'THB' | 'USDT' | 'MMK', showCurrency = true): string {
  if (isNaN(amount) || !isFinite(amount)) {
    const symbol = showCurrency ? CURRENCY_SYMBOLS[currency] : '';
    return `${symbol}0.00`;
  }

  const absAmount = Math.abs(amount);
  const decimals = currency === 'MMK' ? 0 : 2; // MMK typically doesn't use decimals
  
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const prefix = showCurrency ? CURRENCY_SYMBOLS[currency] : '';
  return amount < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Format large numbers with abbreviations for any currency
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted currency string with abbreviations
 */
export function formatCurrencyCompact(amount: number, currency: 'THB' | 'USDT' | 'MMK'): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return `${CURRENCY_SYMBOLS[currency]}0.00`;
  }

  const absAmount = Math.abs(amount);
  const symbol = CURRENCY_SYMBOLS[currency];
  
  if (absAmount >= 1000000) {
    const millions = amount / 1000000;
    return `${symbol}${millions.toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    const thousands = amount / 1000;
    return `${symbol}${thousands.toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currency);
}

/**
 * Parse currency string to number
 * @param value - Currency string
 * @param currency - Currency code  
 * @returns Parsed number
 */
export function parseCurrency(value: string, currency: 'THB' | 'USDT' | 'MMK'): number {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove currency symbol, spaces, and commas
  const symbol = CURRENCY_SYMBOLS[currency];
  const cleanValue = value.replace(new RegExp(`[${symbol},\\s]`, 'g'), '').trim();
  if (!cleanValue) return 0;
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @returns Boolean indicating if amount is valid
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
}

/**
 * Get currency symbol
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: 'THB' | 'USDT' | 'MMK'): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Get currency name
 * @param currency - Currency code
 * @returns Currency full name
 */
export function getCurrencyName(currency: 'THB' | 'USDT' | 'MMK'): string {
  return CURRENCY_NAMES[currency];
}

/**
 * Convert currency using exchange rate
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param exchangeRate - Exchange rate (from -> to)
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: 'THB' | 'USDT' | 'MMK',
  toCurrency: 'THB' | 'USDT' | 'MMK',
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
}
