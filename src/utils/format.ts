
export const formatCurrency = (
  amount: number | string, 
  currency: string = 'GBP'
): string => {
  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]/g, '')) 
    : amount;
  
  if (isNaN(numericAmount)) return '£0';
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GB').format(num);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};
