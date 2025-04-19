
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeClockStatus } from './types';
import { AttendanceRecord } from '@/types/supabase/attendance';

export const useStatusCheck = (
  employeeId: string | undefined,
  setCurrentRecord: (record: string | null) => void,
  setStatus: (status: TimeClockStatus) => void
) => {
  useEffect(() => {
    if (!employeeId) return;

    const checkCurrentStatus = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (records && records.length > 0) {
        const record = records[0] as AttendanceRecord;
        setCurrentRecord(record.id);
        
        if (!record.check_out) {
          setStatus(record.break_start ? 'on-break' : 'clocked-in');
        } else {
          setStatus('clocked-out');
        }
      }
    };

    checkCurrentStatus();
  }, [employeeId]);
};
