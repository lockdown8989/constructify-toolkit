
import { useState, useEffect } from 'react';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { useAutoClockout } from './use-auto-clockout';
import { useTimeClockActions } from './use-time-clock-actions';
import { useStatusCheck } from './use-status-check';
import { useAttendanceSync } from './use-attendance-sync';
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

  // Check initial status
  useStatusCheck(employeeData?.id, setCurrentRecord, setStatus);

  // Get time clock actions with state persistence
  const {
    handleClockIn: originalHandleClockIn,
    handleClockOut: originalHandleClockOut,
    handleBreakStart: originalHandleBreakStart,
    handleBreakEnd: originalHandleBreakEnd
  } = useTimeClockActions(setStatus, setCurrentRecord);

  // Wrap actions to persist state
  const handleClockIn = async () => {
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
  };

  const handleClockOut = async () => {
    // Check if currently on break
    if (status === 'on-break') {
      toast({
        title: "End Break First",
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
    
    // Set reminder to end break
    toast({
      title: "Break Started",
      description: "Remember to end your break when you're ready to continue working",
      variant: "default",
    });
  };

  const handleBreakEnd = async () => {
    await originalHandleBreakEnd(currentRecord);
    
    toast({
      title: "Break Ended",
      description: "Welcome back! Continue with your shift",
      variant: "default",
    });
  };

  // Define refresh function for attendance sync
  const refreshAttendanceData = async () => {
    try {
      if (!currentRecord) return;
      
      console.log('Refreshing attendance data for record:', currentRecord);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('id', currentRecord)
        .single();
      
      if (error) {
        console.error('Error refreshing attendance data:', error);
        return;
      }
      
      if (data) {
        // Update status based on synced data
        if (!data.active_session || data.check_out) {
          setStatus('clocked-out');
          setCurrentRecord(null);
          if (!data.active_session) {
            toast({
              title: "Status Updated",
              description: "Your clock-out was registered from another device.",
            });
          }
        } else if (data.break_start) {
          setStatus('on-break');
        } else {
          setStatus('clocked-in');
        }
      }
    } catch (err) {
      console.error('Error in refreshAttendanceData:', err);
    }
  };

  // Handle real-time sync of attendance data
  useAttendanceSync(refreshAttendanceData);

  // Update elapsed time based on current status
  useEffect(() => {
    if (!currentRecord || status === 'clocked-out') return;

    const fetchAttendanceData = async () => {
      if (!currentRecord) return;

      console.log('Fetching attendance data for record:', currentRecord, 'status:', status);

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
