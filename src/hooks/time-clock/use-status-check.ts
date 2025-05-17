
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
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          // Only consider records that were NOT initiated by managers
          .is('manager_initiated', null)
          .maybeSingle();
          
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
