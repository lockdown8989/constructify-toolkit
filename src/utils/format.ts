
/**
 * Formats a number as currency with the specified currency symbol
 * @param amount The amount to format
 * @param currency The currency code (default: 'GBP')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency = 'GBP'): string => {
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  
  if (isNaN(numericAmount)) {
    return '£0';
  }
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Formats a date string in the UK format (DD/MM/YYYY)
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
