
/**
 * Utility functions for handling timezone conversions and time formatting
 */

/**
 * Gets the current ISO string timestamp that preserves timezone information
 * @returns ISO string timestamp
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Converts a local date to ISO string preserving timezone information
 * @param date - The local date object to convert
 * @returns ISO string timestamp
 */
export function dateToISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Formats an ISO string date to a human-readable time format
 * @param isoString - The ISO string to format
 * @param format - Optional format pattern
 * @returns Formatted time string
 */
export function formatTimeFromISO(isoString: string | null | undefined, format: string = 'h:mm a'): string {
  if (!isoString) return '-';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    
    // Simple formatting logic for common patterns
    if (format === 'h:mm a') {
      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `${hours}:${minutes} ${ampm}`;
    }
    
    // Default to localized time string
    return date.toLocaleTimeString();
  } catch (error) {
    console.error('Error formatting ISO time:', error);
    return '-';
  }
}

/**
 * Debug function to log time information
 * @param label - The label for the log
 * @param date - The date object to log
 */
export function debugTimeInfo(label: string, date: Date): void {
  console.log(`${label}:`);
  console.log(`  - Local string: ${date.toLocaleString()}`);
  console.log(`  - ISO string: ${date.toISOString()}`);
  console.log(`  - Timezone offset: ${date.getTimezoneOffset()} minutes`);
  console.log(`  - UTC string: ${date.toUTCString()}`);
}

/**
 * Calculate the duration between two ISO string timestamps in minutes
 * @param startISOString - The start time ISO string
 * @param endISOString - The end time ISO string
 * @returns Duration in minutes
 */
export function calculateDurationMinutes(startISOString: string, endISOString: string): number {
  try {
    const startDate = new Date(startISOString);
    const endDate = new Date(endISOString);
    
    // Calculate duration in milliseconds and convert to minutes
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
}
