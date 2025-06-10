
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';
import { getDeviceIdentifier } from '../utils/device-utils';
import { debugTimeInfo } from '@/utils/timezone-utils';

export const useClockIn = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  const handleClockIn = async (employeeId: string | undefined) => {
    if (!employeeId) {
      console.error('Clock in failed: No employee ID provided');
      toast({
        title: "Error",
        description: "No employee ID provided",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting clock in process for employee:', employeeId);
      
      // Use current time and preserve timezone information with ISO string
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deviceIdentifier = getDeviceIdentifier();
      
      // Log time information for debugging
      debugTimeInfo('Clock-in time', now);
      console.log('Today date:', today);
      
      // First, deactivate any existing active sessions for this employee to prevent conflicts
      console.log('Deactivating any existing active sessions...');
      const { error: deactivateError } = await supabase
        .from('attendance')
        .update({ active_session: false })
        .eq('employee_id', employeeId)
        .eq('active_session', true);
        
      if (deactivateError) {
        console.error('Error deactivating existing sessions:', deactivateError);
        // Continue anyway, don't throw error
      }
      
      // Check if there's already a record for today (any record, active or not)
      console.log('Checking for existing record for today...');
      const { data: existingRecords, error: checkError } = await supabase
        .from('attendance')
        .select('id, active_session, check_in, check_out')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .order('created_at', { ascending: false });
        
      if (checkError) {
        console.error('Error checking for existing records:', checkError);
        throw new Error(`Failed to check for existing records: ${checkError.message}`);
      }
        
      console.log('Existing records check result:', existingRecords);
      
      // Check if there's already an active session among the records
      const activeRecord = existingRecords?.find(record => record.active_session);
      if (activeRecord) {
        console.log('User already has an active session:', activeRecord);
        toast({
          title: "Already clocked in",
          description: "You are already clocked in for today",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Creating new attendance record...');
      
      // Insert new attendance record with ISO string time to preserve timezone
      const insertData = {
        employee_id: employeeId,
        check_in: now.toISOString(), // Store as ISO string to preserve timezone information
        date: today,
        status: 'Present',
        location,
        device_info: deviceInfo,
        active_session: true,
        device_identifier: deviceIdentifier,
        notes: '',
        attendance_status: 'Present' as const,
        manager_initiated: false
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('attendance')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting attendance record:', error);
        throw new Error(`Failed to clock in: ${error.message}`);
      }

      console.log('Successfully created attendance record:', data);

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
        description: error instanceof Error ? error.message : "There was an unexpected error while clocking in",
        variant: "destructive",
      });
    }
  };

  return { handleClockIn };
};
