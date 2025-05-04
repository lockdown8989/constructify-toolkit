
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';
import { getDeviceIdentifier } from '../utils/device-utils';

export const useClockIn = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  const handleClockIn = async (employeeId: string | undefined) => {
    if (!employeeId) return;

    const now = new Date();
    const deviceIdentifier = getDeviceIdentifier();
    
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        check_in: now.toISOString(),
        date: now.toISOString().split('T')[0],
        status: 'Present',
        location,
        device_info: deviceInfo,
        active_session: true,
        device_identifier: deviceIdentifier,
        notes: ''
      })
      .select()
      .single();

    if (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error Clocking In",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentRecord(data.id);
    setStatus('clocked-in');
    toast({
      title: "Clocked In",
      description: `You clocked in at ${format(now, 'h:mm a')}`,
    });
  };

  return { handleClockIn };
};
