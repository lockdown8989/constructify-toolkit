
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
    if (!employeeId) {
      toast({
        title: "Error",
        description: "No employee ID provided",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deviceIdentifier = getDeviceIdentifier();
      
      // Check if there's already an active session for today
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance')
        .select('id, active_session')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .eq('active_session', true)
        .is('manager_initiated', false)  // Only check for employee-initiated sessions
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing active session:', checkError);
        toast({
          title: "Error",
          description: "Failed to check for active sessions",
          variant: "destructive",
        });
        return;
      }
        
      if (existingRecord?.active_session) {
        toast({
          title: "Already clocked in",
          description: "You are already clocked in for today",
          variant: "destructive",
        });
        return;
      }
      
      // Insert new attendance record
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          check_in: now.toISOString(),
          date: today,
          status: 'Present',
          location,
          device_info: deviceInfo,
          active_session: true,
          device_identifier: deviceIdentifier,
          notes: '',
          attendance_status: 'Present',
          manager_initiated: false  // Explicitly mark as employee-initiated
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
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error",
        description: "There was an unexpected error while clocking in",
        variant: "destructive",
      });
    }
  };

  return { handleClockIn };
};
