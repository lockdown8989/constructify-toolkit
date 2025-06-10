
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
        // For personal time clock, only consider self-initiated sessions (not manager initiated)
        const { data: records, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          .is('manager_initiated', false) // Explicitly look for non-manager initiated sessions
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error checking time clock status:', error);
          return;
        }
        
        // Get the most recent active session
        const activeRecord = records && records.length > 0 ? records[0] : null;
        
        if (activeRecord) {
          // We have an active session
          console.log('Active session found:', activeRecord);
          setCurrentRecord(activeRecord.id);
          
          // Check if on break
          if (activeRecord.break_start && !activeRecord.check_out) {
            setStatus('on-break');
          } else {
            setStatus('clocked-in');
          }
        } else {
          // No active session
          console.log('No active session found');
          setStatus('clocked-out');
          setCurrentRecord(null);
        }
      } catch (err) {
        console.error('Error in checkCurrentStatus:', err);
        setStatus('clocked-out');
        setCurrentRecord(null);
      }
    };
    
    checkCurrentStatus();
  }, [employeeId, setCurrentRecord, setStatus]);
};
