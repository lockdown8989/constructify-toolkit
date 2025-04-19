
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TimeClockStatus } from './types';
import { useAttendanceMetadata } from './use-attendance-metadata';

export const useAutoClockout = (
  employeeId: string | undefined,
  currentRecord: string | null,
  status: TimeClockStatus,
  setStatus: (status: TimeClockStatus) => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key?.includes('supabase.auth') && employeeId && currentRecord && status !== 'clocked-out') {
        if (event.newValue === null || !event.newValue.includes('access_token')) {
          await performAutoClockout(employeeId, currentRecord);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentRecord, employeeId, status]);

  const performAutoClockout = async (employeeId: string, recordId: string) => {
    console.log('Performing auto-clockout for employee:', employeeId, 'record:', recordId);
    
    const now = new Date();
    
    const { data: record } = await supabase
      .from('attendance')
      .select('break_start, break_minutes')
      .eq('id', recordId)
      .single();
      
    if (record?.break_start) {
      const breakStart = new Date(record.break_start);
      const existingBreakMinutes = record.break_minutes || 0;
      const breakMinutes = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60)) + existingBreakMinutes;
      
      await supabase
        .from('attendance')
        .update({
          break_minutes: breakMinutes,
          break_start: null,
          check_out: now.toISOString(),
          status: 'Auto-logout',
          location,
          device_info: deviceInfo,
          notes: 'Automatically clocked out due to session end'
        })
        .eq('id', recordId);
    } else {
      await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          status: 'Auto-logout',
          location,
          device_info: deviceInfo,
          notes: 'Automatically clocked out due to session end'
        })
        .eq('id', recordId);
    }
    
    setCurrentRecord(null);
    setStatus('clocked-out');
    
    toast({
      title: "Auto Clock-Out",
      description: `You were automatically clocked out at ${format(now, 'h:mm a')} due to session end`,
    });
  };

  return { performAutoClockout };
};
