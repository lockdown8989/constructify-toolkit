
import { trackMissedClockOut, checkLateArrivals } from './pattern-attendance-tracker';

let monitoringInterval: NodeJS.Timeout | null = null;

/**
 * Start monitoring attendance for pattern compliance
 */
export const startAttendanceMonitoring = () => {
  console.log('Starting attendance monitoring service...');
  
  // Stop existing monitoring if running
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
  
  // Check every 5 minutes
  monitoringInterval = setInterval(async () => {
    try {
      await trackMissedClockOut();
      await checkLateArrivals();
    } catch (error) {
      console.error('Error in attendance monitoring:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Run initial check
  setTimeout(async () => {
    try {
      await trackMissedClockOut();
      await checkLateArrivals();
    } catch (error) {
      console.error('Error in initial attendance check:', error);
    }
  }, 1000);
};

/**
 * Stop monitoring attendance
 */
export const stopAttendanceMonitoring = () => {
  console.log('Stopping attendance monitoring service...');
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
};
