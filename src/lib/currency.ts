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