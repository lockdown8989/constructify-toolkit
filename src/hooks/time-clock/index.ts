
import { useState, useEffect, useCallback } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAutoClockout } from './use-auto-clockout';
import { useTimeClockActions } from './use-time-clock-actions';
import { useStatusCheck } from './use-status-check';
import { useAttendanceSync } from './use-attendance-sync';
import { useOvertimeMonitoring } from './use-overtime-monitoring';
import { useClockNotifications } from '@/hooks/use-clock-notifications';
import { TimeClockStatus, TimelogEntry } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTimeClock = () => {
  const [status, setStatus] = useState<TimeClockStatus>('clocked-out');
  const [currentRecord, setCurrentRecord] = useState<string | null>(null);
  const [timelog, setTimelog] = useState<TimelogEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [lastAction, setLastAction] = useState<'in' | 'out' | null>(null);
  const { employeeData } = useEmployeeDataManagement();
  const { toast } = useToast();

  // Setup clock notifications
  useClockNotifications();

  // Persist last action in localStorage
  useEffect(() => {
    if (employeeData?.id) {
      const storageKey = `timeClockAction_${employeeData.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored && (stored === 'in' || stored === 'out')) {
        setLastAction(stored);
      }
    }
  }, [employeeData?.id]);

  // Save action to localStorage when it changes
  useEffect(() => {
    if (employeeData?.id && lastAction) {
      const storageKey = `timeClockAction_${employeeData.id}`;
      localStorage.setItem(storageKey, lastAction);
    }
  }, [employeeData?.id, lastAction]);

  // Initialize auto-clockout
  useAutoClockout(
    employeeData?.id,
    currentRecord,
    status,
    setStatus,
    setCurrentRecord
  );

  // Check initial status and handle page refresh
  useStatusCheck(employeeData?.id, setCurrentRecord, setStatus);

  // Monitor for overtime when clocked in
  useOvertimeMonitoring(employeeData?.id, currentRecord, status);

  // Get time clock actions with state persistence
  const {
    handleClockIn: originalHandleClockIn,
    handleClockOut: originalHandleClockOut,
    handleBreakStart: originalHandleBreakStart,
    handleBreakEnd: originalHandleBreakEnd
  } = useTimeClockActions(setStatus, setCurrentRecord);

  // Define refresh function for attendance sync
  const refreshAttendanceData = useCallback(async () => {
    try {
      if (!employeeData?.id) return;
      
      console.log('Refreshing attendance data for employee:', employeeData.id);
      
      // Re-check the current status from the database
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const { data: records, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeData.id)
        .eq('date', today)
        .eq('active_session', true)
        .is('manager_initiated', false)
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error('Error refreshing attendance data:', error);
        return;
      }
      
      const activeRecord = records && records.length > 0 ? records[0] : null;
      
      if (activeRecord) {
        setCurrentRecord(activeRecord.id);
        
        // Check if on break
        if (activeRecord.on_break === true || (activeRecord.break_start && !activeRecord.check_out)) {
          setStatus('on-break');
        } else {
          setStatus('clocked-in');
        }
      } else {
        setStatus('clocked-out');
        setCurrentRecord(null);
      }
    } catch (err) {
      console.error('Error in refreshAttendanceData:', err);
    }
  }, [employeeData?.id]);

  // Handle real-time sync of attendance data
  useAttendanceSync(refreshAttendanceData);

  // Wrap actions to persist state and show enhanced notifications
  const handleClockIn = async () => {
    await originalHandleClockIn(employeeData?.id);
    setLastAction('in');
  };

  const handleClockOut = async () => {
    // Check if currently on break
    if (status === 'on-break') {
      toast({
        title: "⚠️ End Break First",
        description: "Please end your current break before clocking out",
        variant: "destructive",
      });
      return;
    }
    
    await originalHandleClockOut(currentRecord);
    setLastAction('out');
    
    // Clear the stored action on clock out
    if (employeeData?.id) {
      const storageKey = `timeClockAction_${employeeData.id}`;
      localStorage.removeItem(storageKey);
    }
  };

  const handleBreakStart = async () => {
    await originalHandleBreakStart(currentRecord);
  };

  const handleBreakEnd = async () => {
    await originalHandleBreakEnd(currentRecord);
  };

  // Update elapsed time based on current status
  useEffect(() => {
    if (!currentRecord || status === 'clocked-out') return;

    const fetchAttendanceData = async () => {
      if (!currentRecord) return;

      console.log('Fetching attendance data for record:', currentRecord, 'status:', status);

      const { data, error } = await supabase
        .from('attendance')
        .select('check_in, break_minutes, break_start, scheduled_end_time, overtime_minutes')
        .eq('id', currentRecord)
        .single();

      if (error) {
        console.error('Error fetching attendance data:', error);
        return;
      }

      if (data) {
        console.log('Attendance data retrieved:', data);
        
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
          }
          
          setElapsedTime(Math.max(0, totalSeconds));
          setCurrentTime(now);
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
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
    
    // Additional state needed by TimeClockWidget
    timelog,
    setTimelog,
    currentTime,
    setCurrentTime,
    elapsedTime,
    setElapsedTime,
    breakTime,
    setBreakTime,
    currentRecord,
    lastAction,
    
    // Employee data
    employeeId: employeeData?.id
  };
};

export type { TimeClockStatus, TimelogEntry };
