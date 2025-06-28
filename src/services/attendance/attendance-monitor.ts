
import { checkAndSendClockOutReminders, recordLateClockIn } from './shift-reminders';

/**
 * Main attendance monitoring service
 * This should be called periodically (e.g., every 15 minutes) to check for:
 * - Late clock-ins
 * - Missing clock-outs
 * - Overtime tracking
 */
export const monitorAttendance = async () => {
  try {
    console.log('Starting attendance monitoring...');
    
    // Check for employees who should have clocked out
    const clockOutResult = await checkAndSendClockOutReminders();
    console.log('Clock-out reminder check:', clockOutResult);
    
    // Additional monitoring tasks can be added here
    // - Check for missed shifts
    // - Calculate daily overtime
    // - Send end-of-shift reminders
    
    return {
      success: true,
      message: 'Attendance monitoring completed successfully',
      details: {
        clockOutReminders: clockOutResult
      }
    };
  } catch (error) {
    console.error('Error in attendance monitoring:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Initialize attendance monitoring
 * This should be called when the app starts
 */
export const initializeAttendanceMonitoring = () => {
  // Run monitoring every 15 minutes
  const intervalId = setInterval(() => {
    monitorAttendance();
  }, 15 * 60 * 1000); // 15 minutes in milliseconds
  
  // Run once immediately
  monitorAttendance();
  
  return intervalId;
};
