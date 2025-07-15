/**
 * Enhanced timezone utilities for multi-location companies
 */

import { getUserTimezone, formatTimezoneOffset, getTimezoneOffset } from './timezone-utils';

export interface TimezoneInfo {
  timezone: string;
  offset: number;
  offsetString: string;
  name: string;
  abbreviation?: string;
}

/**
 * Common business timezones with their display names
 */
export const BUSINESS_TIMEZONES: Record<string, string> = {
  'UTC': 'Coordinated Universal Time',
  'America/New_York': 'Eastern Time (US)',
  'America/Chicago': 'Central Time (US)',
  'America/Denver': 'Mountain Time (US)',
  'America/Los_Angeles': 'Pacific Time (US)',
  'Europe/London': 'Greenwich Mean Time',
  'Europe/Paris': 'Central European Time',
  'Europe/Berlin': 'Central European Time',
  'Europe/Madrid': 'Central European Time',
  'Europe/Rome': 'Central European Time',
  'Asia/Tokyo': 'Japan Standard Time',
  'Asia/Shanghai': 'China Standard Time',
  'Asia/Kolkata': 'India Standard Time',
  'Australia/Sydney': 'Australian Eastern Time',
  'America/Toronto': 'Eastern Time (Canada)',
  'America/Vancouver': 'Pacific Time (Canada)',
  'Asia/Dubai': 'Gulf Standard Time',
  'Asia/Singapore': 'Singapore Standard Time',
  'Europe/Sofia': 'Eastern European Time',
  'Europe/Warsaw': 'Central European Time',
  'Europe/Bucharest': 'Eastern European Time'
};

/**
 * Get current timezone information
 */
export function getCurrentTimezoneInfo(): TimezoneInfo {
  const timezone = getUserTimezone();
  const offset = getTimezoneOffset();
  
  return {
    timezone,
    offset,
    offsetString: formatTimezoneOffset(offset),
    name: BUSINESS_TIMEZONES[timezone] || timezone,
  };
}

/**
 * Get timezone info for a specific timezone
 */
export function getTimezoneInfo(timezone: string): TimezoneInfo {
  try {
    const now = new Date();
    const timeInZone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const offset = (now.getTime() - timeInZone.getTime()) / (1000 * 60);
    
    return {
      timezone,
      offset,
      offsetString: formatTimezoneOffset(offset),
      name: BUSINESS_TIMEZONES[timezone] || timezone,
    };
  } catch (error) {
    console.error('Error getting timezone info:', error);
    return getCurrentTimezoneInfo();
  }
}

/**
 * Convert time from one timezone to another
 */
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  try {
    // Create a date string in the source timezone
    const dateString = date.toLocaleString("sv-SE", { timeZone: fromTimezone });
    const sourceDate = new Date(dateString + " UTC");
    
    // Convert to target timezone
    const targetDate = new Date(sourceDate.toLocaleString("en-US", { timeZone: toTimezone }));
    return targetDate;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return date;
  }
}

/**
 * Format time in a specific timezone
 */
export function formatTimeInTimezone(
  date: Date | string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    };
    
    return dateObj.toLocaleString('en-US', {
      ...defaultOptions,
      timeZone: timezone,
    });
  } catch (error) {
    console.error('Error formatting time in timezone:', error);
    return '-';
  }
}

/**
 * Get list of timezone options for dropdowns
 */
export function getTimezoneOptions(): Array<{ value: string; label: string }> {
  return Object.entries(BUSINESS_TIMEZONES).map(([value, name]) => ({
    value,
    label: `${name} (${value})`,
  }));
}

/**
 * Detect user's timezone preference based on browser settings
 */
export function detectUserTimezone(): TimezoneInfo {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return getTimezoneInfo(timezone);
}

/**
 * Calculate time difference between two timezones
 */
export function getTimezoneDifference(
  timezone1: string,
  timezone2: string
): number {
  const now = new Date();
  const time1 = new Date(now.toLocaleString("en-US", { timeZone: timezone1 }));
  const time2 = new Date(now.toLocaleString("en-US", { timeZone: timezone2 }));
  
  return (time1.getTime() - time2.getTime()) / (1000 * 60); // difference in minutes
}

/**
 * Check if two timezones are in the same offset
 */
export function areTimezonesInSameOffset(timezone1: string, timezone2: string): boolean {
  return getTimezoneDifference(timezone1, timezone2) === 0;
}

/**
 * Get business hours in different timezones
 */
export function getBusinessHoursInTimezone(
  businessHours: { start: string; end: string },
  timezone: string
): { start: string; end: string } {
  try {
    const today = new Date();
    const startTime = new Date(`${today.toDateString()} ${businessHours.start}`);
    const endTime = new Date(`${today.toDateString()} ${businessHours.end}`);
    
    return {
      start: formatTimeInTimezone(startTime, timezone),
      end: formatTimeInTimezone(endTime, timezone),
    };
  } catch (error) {
    console.error('Error calculating business hours:', error);
    return businessHours;
  }
}

/**
 * Check if current time is within business hours for a timezone
 */
export function isWithinBusinessHours(
  timezone: string,
  businessHours: { start: string; end: string } = { start: '09:00', end: '17:00' }
): boolean {
  try {
    const now = new Date();
    const currentTimeInZone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    
    const businessStart = new Date(currentTimeInZone);
    businessStart.setHours(startHour, startMinute, 0, 0);
    
    const businessEnd = new Date(currentTimeInZone);
    businessEnd.setHours(endHour, endMinute, 0, 0);
    
    return currentTimeInZone >= businessStart && currentTimeInZone <= businessEnd;
  } catch (error) {
    console.error('Error checking business hours:', error);
    return false;
  }
}