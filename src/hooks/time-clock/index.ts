
import { useState, useEffect } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAutoClockout } from './use-auto-clockout';
import { useTimeClockActions } from './use-time-clock-actions';
import { useStatusCheck } from './use-status-check';
import { TimeClockStatus, TimelogEntry } from './types';
import { supabase } from '@/integrations/supabase/client';

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

  // Update elapsed time based on current status
  useEffect(() => {
    if (!currentRecord || status === 'clocked-out') return;

    const fetchAttendanceData = async () => {
      if (!currentRecord) return;

      const { data, error } = await supabase
        .from('attendance')
        .select('check_in, break_minutes, break_start')
        .eq('id', currentRecord)
        .single();

      if (error) {
        console.error('Error fetching attendance data:', error);
        return;
      }

      if (data) {
        const checkInTime = new Date(data.check_in);
        const breakMinutes = data.break_minutes || 0;
        const breakStartTime = data.break_start ? new Date(data.break_start) : null;
        
        // Set initial break time
        setBreakTime(breakMinutes * 60);

        // Start timer to update elapsed time
        const timer = setInterval(() => {
          const now = new Date();
          let totalSeconds = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
          
          // Subtract break time (in seconds)
          totalSeconds -= breakTime;
          
          // If currently on break, calculate current break duration
          if (status === 'on-break' && breakStartTime) {
            const currentBreakSeconds = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000);
            setBreakTime(breakMinutes * 60 + currentBreakSeconds);
            // Don't subtract current break from elapsed time (it's already accounted for)
          }
          
          setElapsedTime(Math.max(0, totalSeconds));
        }, 1000);

        return () => clearInterval(timer);
      }
    };

    fetchAttendanceData();
  }, [currentRecord, status, breakTime]);

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
