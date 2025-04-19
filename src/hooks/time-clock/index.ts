
import { useState } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAutoClockout } from './use-auto-clockout';
import { useTimeClockActions } from './use-time-clock-actions';
import { useStatusCheck } from './use-status-check';
import { TimeClockStatus, TimelogEntry } from './types';

export const useTimeClock = () => {
  const [status, setStatus] = useState<TimeClockStatus>('clocked-out');
  const [currentRecord, setCurrentRecord] = useState<string | null>(null);
  const [timelog, setTimelog] = useState<TimelogEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const { employeeData } = useEmployeeDataManagement();

  // Initialize auto-clockout
  useAutoClockout(
    employeeData?.id,
    currentRecord,
    status,
    setStatus,
    setCurrentRecord
  );

  // Check initial status
  useStatusCheck(employeeData?.id, setCurrentRecord, setStatus);

  // Get time clock actions
  const {
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd
  } = useTimeClockActions(setStatus, setCurrentRecord);

  return {
    // Status and actions
    status,
    setStatus,
    handleClockIn: () => handleClockIn(employeeData?.id),
    handleClockOut: () => handleClockOut(currentRecord),
    handleBreakStart: () => handleBreakStart(currentRecord),
    handleBreakEnd: () => handleBreakEnd(currentRecord),
    
    // Additional state needed by TimeClockWidget
    timelog,
    setTimelog,
    currentTime,
    setCurrentTime,
    elapsedTime,
    setElapsedTime,
    breakTime,
    setBreakTime,
    currentRecord
  };
};

export type { TimeClockStatus, TimelogEntry };
