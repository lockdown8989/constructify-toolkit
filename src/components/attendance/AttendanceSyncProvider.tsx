
import React from 'react';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';

const AttendanceSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This hook sets up the realtime listeners for attendance sync
  useAttendanceSync();
  
  // This component doesn't render anything, just initializes the sync system
  return <>{children}</>;
};

export default AttendanceSyncProvider;
