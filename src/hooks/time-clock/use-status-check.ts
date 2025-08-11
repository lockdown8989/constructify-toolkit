
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
        
        // Check if there's an active session for today using the new current_status column
        const { data: records, error } = await supabase
          .from('attendance')
          .select('id, current_status, break_start, check_out, on_break, check_in, active_session')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          .is('manager_initiated', false)
          .order('check_in', { ascending: false });
          
        if (error) {
          console.error('Error checking time clock status:', error);
          return;
        }
        
        console.log('Found records:', records);
        
        // Get the most recent active session
        const activeRecord = records && records.length > 0 ? records[0] : null;
        
        if (activeRecord) {
          console.log('Active session found:', activeRecord);
          setCurrentRecord(activeRecord.id);
          
          // Use the current_status column first, then fall back to existing logic
          if (activeRecord.current_status) {
            console.log('Using current_status from database:', activeRecord.current_status);
            setStatus(activeRecord.current_status as TimeClockStatus);
          } else {
            // Fallback to existing logic if current_status is not set
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
          }
        } else {
          // No active session - check if there are any records for today
          const { data: todayRecords, error: todayError } = await supabase
            .from('attendance')
            .select('id, check_in, check_out, current_status, on_break, break_start')
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
    
    // Set up a more frequent check every 5 seconds for better responsiveness
    const intervalId = setInterval(checkCurrentStatus, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [employeeId, setCurrentRecord, setStatus]);
};
