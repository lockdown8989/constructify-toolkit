
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
        title: "❌ Error",
        description: "No active session to clock out from",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Clocking out with record ID:', currentRecord);

      const now = new Date();
      debugTimeInfo('Clock-out time', now);
      console.log('Current device time:', now.toLocaleString());
      
      // Get check-in time and employee details to calculate duration
      const { data: checkInData, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          check_in, 
          break_minutes, 
          employee_id,
          shift_pattern_id,
          scheduled_start_time,
          scheduled_end_time
        `)
        .eq('id', currentRecord)
        .single();
        
      if (fetchError) {
        console.error('Error fetching check-in data:', fetchError);
        throw fetchError;
      }
      
      const checkInTime = new Date(checkInData.check_in);
      console.log('Check-in time from DB:', checkInData.check_in);
      console.log('Parsed check-in time:', checkInTime.toLocaleString());
      console.log('Clock-out device time:', now.toLocaleString());
      
      // Calculate working minutes based on exact timestamps
      const totalMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
      const breakMinutes = checkInData.break_minutes || 0;
      const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
      
      // Calculate overtime based on shift pattern if available
      let overtimeMinutes = 0;
      let isEarlyDeparture = false;
      let earlyDepartureMinutes = 0;

      if (checkInData.shift_pattern_id) {
        const { data: shiftPattern } = await supabase
          .from('shift_patterns')
          .select('*')
          .eq('id', checkInData.shift_pattern_id)
          .single();

        if (shiftPattern) {
          const today = now.toISOString().split('T')[0];
          const scheduledEnd = new Date(`${today}T${shiftPattern.end_time}`);
          
          // Handle night shifts that cross midnight
          if (shiftPattern.end_time < shiftPattern.start_time) {
            scheduledEnd.setDate(scheduledEnd.getDate() + 1);
          }
          
          const overtimeThreshold = new Date(scheduledEnd.getTime() + shiftPattern.overtime_threshold_minutes * 60000);
          
          if (now > overtimeThreshold) {
            overtimeMinutes = Math.round((now.getTime() - scheduledEnd.getTime()) / (1000 * 60));
          } else if (now < scheduledEnd) {
            isEarlyDeparture = true;
            earlyDepartureMinutes = Math.round((scheduledEnd.getTime() - now.getTime()) / (1000 * 60));
          }
        }
      } else {
        // Fallback calculation: overtime after 8 hours
        overtimeMinutes = Math.max(0, workingMinutes - 480);
      }
      
      const regularMinutes = workingMinutes - overtimeMinutes;
      
      console.log('Time calculation:', {
        totalMinutes,
        breakMinutes,
        workingMinutes,
        regularMinutes,
        overtimeMinutes,
        isEarlyDeparture,
        earlyDepartureMinutes
      });
      
      // Update the record with clock-out data and proper current_status
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          active_session: false,
          current_status: 'clocked-out',
          working_minutes: regularMinutes,
          overtime_minutes: overtimeMinutes,
          early_departure_minutes: earlyDepartureMinutes,
          is_early_departure: isEarlyDeparture,
          location,
          device_info: deviceInfo,
          on_break: false,
          break_start: null
        })
        .eq('id', currentRecord);

      if (error) {
        console.error('Error clocking out:', error);
        toast({
          title: "❌ Error Clocking Out",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully clocked out at device time:', now.toLocaleString());

      setCurrentRecord(null);
      setStatus('clocked-out');
      
      // Show immediate success notification
      toast({
        title: "✅ Successfully Clocked Out",
        description: `You clocked out at ${format(now, 'h:mm a')}. Great work today!`,
        variant: "default",
      });

      // Show specific additional message based on early departure or overtime
      setTimeout(() => {
        if (isEarlyDeparture) {
          toast({
            title: "⚠️ Early Departure Noted",
            description: `You left ${earlyDepartureMinutes} minutes early. This has been recorded.`,
            variant: "destructive",
          });
        } else if (overtimeMinutes > 0) {
          toast({
            title: "⏰ Overtime Recorded",
            description: `You worked ${overtimeMinutes} minutes of overtime. Thanks for your dedication!`,
            variant: "default",
          });
        } else {
          toast({
            title: "🎯 Perfect Timing!",
            description: `You completed your shift right on schedule. Well done!`,
            variant: "default",
          });
        }
      }, 2000);

      // Show work summary
      setTimeout(() => {
        const hoursWorked = Math.floor(workingMinutes / 60);
        const minutesWorked = workingMinutes % 60;
        toast({
          title: "📊 Shift Summary",
          description: `Total work time: ${hoursWorked}h ${minutesWorked}m${breakMinutes > 0 ? ` (${breakMinutes}m break)` : ''}`,
          variant: "default",
        });
      }, 4000);

    } catch (error) {
      console.error('Error in handleClockOut:', error);
      toast({
        title: "❌ Error",
        description: "There was an unexpected error while clocking out",
        variant: "destructive",
      });
    }
  };

  return { handleClockOut };
};
