
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TimeClockStatus } from './types';

export const useStatusCheck = (
  employeeId: string | undefined,
  setCurrentRecord: (id: string | null) => void,
  setStatus: (status: TimeClockStatus) => void
) => {
  useEffect(() => {
    const checkCurrentStatus = async () => {
      if (!employeeId) return;
      
      try {
        console.log('Checking current time clock status for employee:', employeeId);
        
        // Get today's date in the user's local timezone
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        console.log('Checking for date:', today, 'Current time:', now.toLocaleString());
        
        // Check if there's an active session for today
        // For personal time clock, only consider self-initiated sessions (not manager initiated)
        const { data: records, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          .is('manager_initiated', false) // Explicitly look for non-manager initiated sessions
          .order('check_in', { ascending: false }); // Order by check_in time instead of created_at
          
        if (error) {
          console.error('Error checking time clock status:', error);
          return;
        }
        
        console.log('Found records:', records);
        
        // Get the most recent active session
        const activeRecord = records && records.length > 0 ? records[0] : null;
        
        if (activeRecord) {
          // We have an active session
          console.log('Active session found:', activeRecord);
          setCurrentRecord(activeRecord.id);
          
          // Check if on break - look for break_start without break_end
          // Also check the on_break flag for more reliable status detection
          if (activeRecord.break_start && !activeRecord.check_out) {
            console.log('Employee is on break - break_start exists and no check_out');
            setStatus('on-break');
          } else if (activeRecord.on_break === true) {
            console.log('Employee is on break - on_break flag is true');
            setStatus('on-break');
          } else {
            console.log('Employee is clocked in - active session without break');
            setStatus('clocked-in');
          }
        } else {
          // No active session - check if there are any records for today that are not active
          const { data: todayRecords, error: todayError } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', today)
            .order('check_in', { ascending: false });
            
          if (todayError) {
            console.error('Error checking today records:', todayError);
          }
          
          console.log('Today records:', todayRecords);
          
          // No active session
          console.log('No active session found - employee is clocked out');
          setStatus('clocked-out');
          setCurrentRecord(null);
        }
      } catch (err) {
        console.error('Error in checkCurrentStatus:', err);
        setStatus('clocked-out');
        setCurrentRecord(null);
      }
    };
    
    // Check status immediately when component mounts
    checkCurrentStatus();
    
    // Set up a more frequent check every 10 seconds to ensure status stays in sync
    // This helps catch status changes made from other devices or sessions
    const intervalId = setInterval(checkCurrentStatus, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [employeeId, setCurrentRecord, setStatus]);
};
