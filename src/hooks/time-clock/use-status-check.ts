
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeClockStatus } from './types';
import { AttendanceRecord } from '@/types/supabase/attendance';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export const useStatusCheck = (
  employeeId: string | undefined,
  setCurrentRecord: (record: string | null) => void,
  setStatus: (status: TimeClockStatus) => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!employeeId) return;

    const checkCurrentStatus = async () => {
      try {
        console.log('Checking current status for employee:', employeeId);
        const today = new Date().toISOString().split('T')[0];
        
        // Check for any active session for this employee
        const { data: records, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .eq('active_session', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking time clock status:', error);
          return;
        }

        if (records && records.length > 0) {
          const record = records[0] as AttendanceRecord;
          console.log('Found active time clock session:', record.id);
          setCurrentRecord(record.id);
          
          // Determine status from record
          if (!record.check_out) {
            setStatus(record.break_start ? 'on-break' : 'clocked-in');
            
            // Notify user that their clock session was restored
            toast({
              title: "Time Clock Restored",
              description: "Your previous clock-in session has been restored.",
            });
          } else {
            // Should not happen as active_session should be false when checked out
            setStatus('clocked-out');
          }
        } else {
          console.log('No active time clock sessions found');
          setStatus('clocked-out');
        }
      } catch (err) {
        console.error('Error in checkCurrentStatus:', err);
      }
    };

    // Execute once when component mounts
    checkCurrentStatus();
  }, [employeeId, setCurrentRecord, setStatus, toast]);
};
