
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
      console.log('Current device time:', now.toLocaleString());
      
      // Get check-in time to calculate duration
      const { data: checkInData, error: fetchError } = await supabase
        .from('attendance')
        .select('check_in, break_minutes')
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
      console.log('Clock-out device time:', now.toLocaleString());
      
      // Calculate working minutes based on exact timestamps
      const totalMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
      const breakMinutes = checkInData.break_minutes || 0;
      const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
      const overtimeMinutes = Math.max(0, workingMinutes - 480); // Over 8 hours
      const regularMinutes = workingMinutes - overtimeMinutes;
      
      console.log('Time calculation:', {
        totalMinutes,
        breakMinutes,
        workingMinutes,
        regularMinutes,
        overtimeMinutes
      });
      
      // Update the record with clock-out data using ISO string
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(), // Store as ISO string to preserve timezone information
          active_session: false,
          working_minutes: regularMinutes, // Regular minutes
          overtime_minutes: overtimeMinutes,
          location,
          device_info: deviceInfo,
          on_break: false, // Clear break status
          break_start: null // Clear break start time
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

      console.log('Successfully clocked out at device time:', now.toLocaleString());

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
