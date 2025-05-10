
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
 * Format currency with proper symbol and formatting
 */
export const formatCurrency = (amount: number | string, currency: string = 'GBP'): string => {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/[^\d.]/g, ''));
  }
  
  if (isNaN(amount)) return '0';
  
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format number with commas for thousands
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-GB').format(num);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Format date range as a string
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '-';
  }
  
  const startStr = start.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
  
  const endStr = end.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
};

/**
 * Format time to 12-hour format with AM/PM
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '-';
  
  try {
    // For full datetime strings
    if (timeString.includes('T') || timeString.includes('-')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
    }
    
    // For time-only strings (HH:MM format)
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    return timeString;
  } catch (e) {
    return timeString;
  }
};

