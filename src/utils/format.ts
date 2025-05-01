
/**
 * Format date to a readable string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number | string, currency: string = 'GBP'): string => {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/[^\d.]/g, ''));
  }
  
  if (isNaN(amount)) return '0';
  
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
