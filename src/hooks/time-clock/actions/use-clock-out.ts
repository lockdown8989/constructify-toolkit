
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';

export const useClockOut = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  const handleClockOut = async (currentRecord: string | null) => {
    if (!currentRecord) return;

    console.log('Clocking out with record ID:', currentRecord);

    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString(),
        active_session: false, // Mark session as inactive
        location,
        device_info: deviceInfo
      })
      .eq('id', currentRecord);

    if (error) {
      console.error('Error clocking out:', error);
      toast({
        title: "Error Clocking Out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCurrentRecord(null);
    setStatus('clocked-out');
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${format(now, 'h:mm a')}`,
    });
  };

  return { handleClockOut };
};
