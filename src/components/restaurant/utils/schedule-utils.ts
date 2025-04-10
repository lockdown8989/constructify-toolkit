
// Utility functions for the restaurant schedule components

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
};

// Days of the week arrays for reuse
export const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const daysDisplayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Calculate hours between two time strings
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return (endMinutes - startMinutes) / 60;
};

/**
 * Helper for drag and drop operations
 */
export const isDragEvent = (event: Event): event is DragEvent => {
  return event.type.startsWith('drag') || event.type === 'drop';
};
