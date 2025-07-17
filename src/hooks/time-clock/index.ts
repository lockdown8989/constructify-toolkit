
import { useState, useEffect, useCallback } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAutoClockout } from './use-auto-clockout';
import { useTimeClockActions } from './use-time-clock-actions';
import { useStatusCheck } from './use-status-check';
import { useAttendanceSync } from './use-attendance-sync';
import { useOvertimeMonitoring } from './use-overtime-monitoring';
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

  // Wrap actions to persist state and add logging
  const handleClockIn = async () => {
    console.log('handleClockIn called for employee:', employeeData?.id);
    try {
      await originalHandleClockIn(employeeData?.id);
      setLastAction('in');
      
      // Show break reminder after successful clock in
      setTimeout(() => {
        toast({
          title: "Reminder",
          description: "Remember to take breaks during your shift and end them when finished",
          variant: "default",
        });
      }, 3000);
    } catch (error) {
      console.error('Error in handleClockIn:', error);
      toast({
        title: "Clock In Error",
        description: "There was an error clocking in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClockOut = async () => {
    console.log('handleClockOut called, current status:', status, 'currentRecord:', currentRecord);
    
    // Check if currently on break
    if (status === 'on-break') {
      toast({
        title: "End Break First",
        description: "Please end your current break before clocking out",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentRecord) {
      console.error('No current record found for clock out');
      toast({
        title: "Clock Out Error",
        description: "No active session found to clock out from",
        variant: "destructive",
      });
      return;
    }

    try {
      await originalHandleClockOut(currentRecord);
      setLastAction('out');
      
      // Clear the stored action on clock out
      if (employeeData?.id) {
        const storageKey = `timeClockAction_${employeeData.id}`;
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error in handleClockOut:', error);
      toast({
        title: "Clock Out Error",
        description: "There was an error clocking out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBreakStart = async () => {
    console.log('handleBreakStart called, currentRecord:', currentRecord);
    if (!currentRecord) {
      toast({
        title: "Break Error",
        description: "No active session found to start break",
        variant: "destructive",
      });
      return;
    }

    try {
      await originalHandleBreakStart(currentRecord);
      
      // Set reminder to end break
      toast({
        title: "Break Started",
        description: "Remember to end your break when you're ready to continue working",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in handleBreakStart:', error);
      toast({
        title: "Break Error",
        description: "There was an error starting your break. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBreakEnd = async () => {
    console.log('handleBreakEnd called, currentRecord:', currentRecord);
    if (!currentRecord) {
      toast({
        title: "Break Error",
        description: "No active session found to end break",
        variant: "destructive",
      });
      return;
    }

    try {
      await originalHandleBreakEnd(currentRecord);
      
      toast({
        title: "Break Ended",
        description: "Welcome back! Continue with your shift",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in handleBreakEnd:', error);
      toast({
        title: "Break Error",
        description: "There was an error ending your break. Please try again.",
        variant: "destructive",
      });
    }
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

  // Show break reminder if on break for too long
  useEffect(() => {
    if (status === 'on-break') {
      const reminderTimeout = setTimeout(() => {
        toast({
          title: "Break Reminder",
          description: "You've been on break for a while. Don't forget to end your break when ready!",
          variant: "default",
        });
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearTimeout(reminderTimeout);
    }
  }, [status, toast]);

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
