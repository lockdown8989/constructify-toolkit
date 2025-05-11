/**
 * Format date to a readable string
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format currency with proper symbol and formatting
 */
export const formatCurrency = (amount: number | string, currency: string = 'GBP'): string => {
  if (typeof amount === 'string') {
    // Remove non-numeric characters except for dots
    const cleanedAmount = amount.replace(/[^\d.]/g, '');
    amount = cleanedAmount ? parseFloat(cleanedAmount) : 0;
  }
  
  if (isNaN(amount)) return '£0';
  
  try {
    // Always use GBP for consistency
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `£${amount}`;
  }
};

/**
 * Format number with commas for thousands
 */
export const formatNumber = (num: number): string => {
  try {
    return new Intl.NumberFormat('en-GB').format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0%';
  
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
};

/**
 * Format date range as a string
 */
export const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
  if (!startDate || !endDate) return '-';
  
  try {
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
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '-';
  }
};

/**
 * Format time to 12-hour format with AM/PM
 */
export const formatTime = (timeString: string | null | undefined): string => {
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
      const [hoursStr, minutesStr] = timeString.split(':').map(String);
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) return timeString;
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    return timeString;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
};
