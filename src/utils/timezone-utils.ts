
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
 * Convert a date to local ISO string format
 * This keeps the local time but formats it as ISO
 * @param date - The date to convert
 * @returns Local ISO string
 */
export function dateToLocalISOString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  return (new Date(date.getTime() - tzOffset)).toISOString().slice(0, -1);
}

/**
 * Convert an ISO string to local Date object
 * @param isoString - The ISO string to convert
 * @returns Local date object
 */
export function isoStringToLocalDate(isoString: string): Date {
  return new Date(isoString);
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
 * Get local time display from ISO string
 * @param isoString - The ISO string to format
 * @returns Formatted local time string
 */
export function getLocalTimeDisplay(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting local time:', error);
    return '-';
  }
}

/**
 * Get the user's current timezone 
 * @returns Timezone string (e.g., 'Europe/London')
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC';
  }
}

/**
 * Get timezone offset in minutes from UTC
 * @returns Timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Format a timezone offset to string representation
 * @param offsetMinutes - Timezone offset in minutes
 * @returns Formatted timezone offset (e.g., 'GMT+1:00')
 */
export function formatTimezoneOffset(offsetMinutes: number): string {
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
  console.log(`  - Local ISO string: ${dateToLocalISOString(date)}`);
  console.log(`  - Timezone offset: ${date.getTimezoneOffset()} minutes`);
  console.log(`  - UTC string: ${date.toUTCString()}`);
  console.log(`  - Locale time string: ${date.toLocaleTimeString()}`);
  console.log(`  - User timezone: ${getUserTimezone()}`);
  console.log(`  - Formatted timezone offset: ${formatTimezoneOffset(date.getTimezoneOffset())}`);
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
