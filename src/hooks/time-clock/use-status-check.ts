
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
        
        // Get today's date in the format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's an active session for today
        // Only consider self-initiated sessions (where manager_initiated is null or false)
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          .is('manager_initiated', null)
          .maybeSingle(); // Use maybeSingle to avoid errors when no record
          
        if (error) {
          console.error('Error checking time clock status:', error);
          return;
        }
        
        if (data) {
          // We have an active session
          console.log('Active session found:', data);
          setCurrentRecord(data.id);
          
          // Check if on break
          if (data.break_start && !data.check_out) {
            setStatus('on-break');
          } else {
            setStatus('clocked-in');
          }
        } else {
          // No active session
          console.log('No active session found');
          setStatus('clocked-out');
        }
      } catch (err) {
        console.error('Error in checkCurrentStatus:', err);
      }
    };
    
    checkCurrentStatus();
  }, [employeeId, setCurrentRecord, setStatus]);
};
