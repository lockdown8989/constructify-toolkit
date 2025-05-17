
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';
import { debugTimeInfo } from '@/utils/timezone-utils';

export const useClockOut = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  const handleClockOut = async (currentRecord: string | null) => {
    if (!currentRecord) {
      toast({
        title: "Error",
        description: "No active session to clock out from",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Clocking out with record ID:', currentRecord);

      const now = new Date();
      // Log time information for debugging
      debugTimeInfo('Clock-out time', now);
      
      // Get check-in time to calculate duration
      const { data: checkInData, error: fetchError } = await supabase
        .from('attendance')
        .select('check_in')
        .eq('id', currentRecord)
        .single();
        
      if (fetchError) {
        console.error('Error fetching check-in data:', fetchError);
        throw fetchError;
      }
      
      // Parse check-in time from ISO string
      const checkInTime = new Date(checkInData.check_in);
      console.log('Check-in time from DB:', checkInData.check_in);
      console.log('Parsed check-in time:', checkInTime.toLocaleString());
      
      // Calculate working minutes based on exact timestamps
      const workingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
      const overtimeMinutes = Math.max(0, workingMinutes - 480); // Over 8 hours
      
      // Update the record with clock-out data using ISO string
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(), // Store as ISO string to preserve timezone information
          active_session: false,
          working_minutes: workingMinutes - overtimeMinutes, // Regular minutes
          overtime_minutes: overtimeMinutes,
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
    } catch (error) {
      console.error('Error in handleClockOut:', error);
      toast({
        title: "Error",
        description: "There was an unexpected error while clocking out",
        variant: "destructive",
      });
    }
  };

  return { handleClockOut };
};
