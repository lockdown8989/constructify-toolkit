
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';
import { getDeviceIdentifier } from '../utils/device-utils';
import { checkRotaCompliance } from '@/services/attendance/rota-compliance';
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
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const deviceIdentifier = getDeviceIdentifier();
      
      debugTimeInfo('Clock-in time', now);
      console.log('Today date:', today);
      console.log('Current device time:', now.toLocaleString());
      
      // First, deactivate any existing active sessions for this employee to prevent conflicts
      console.log('Deactivating any existing active sessions...');
      const { error: deactivateError } = await supabase
        .from('attendance')
        .update({ 
          active_session: false,
          current_status: 'clocked-out'
        })
        .eq('employee_id', employeeId)
        .eq('active_session', true);
        
      if (deactivateError) {
        console.error('Error deactivating existing sessions:', deactivateError);
      }
      
      // Check if there's already a record for today
      console.log('Checking for existing record for today...');
      const { data: existingRecords, error: checkError } = await supabase
        .from('attendance')
        .select('id, active_session, check_in, check_out, current_status')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .order('check_in', { ascending: false });
        
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
      
      // Insert new attendance record with proper current_status
      const insertData = {
        employee_id: employeeId,
        check_in: now.toISOString(),
        date: today,
        status: 'Present',
        location,
        device_info: deviceInfo,
        active_session: true,
        current_status: 'clocked-in' as const,
        device_identifier: deviceIdentifier,
        notes: '',
        attendance_status: 'Present' as const,
        manager_initiated: false,
        on_break: false
      };
      
      console.log('Insert data:', insertData);
      console.log('Inserting at device time:', now.toLocaleString());
      
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
      console.log('Clock-in recorded at device time:', now.toLocaleString());

      setCurrentRecord(data.id);
      setStatus('clocked-in');
      
      // Check rota compliance for clock-in
      const { data: rotaComplianceData } = await supabase
        .rpc('validate_rota_compliance', {
          p_employee_id: employeeId,
          p_action_type: 'clock_in',
          p_action_time: now.toISOString()
        });

      const compliance = rotaComplianceData?.[0];
      if (compliance) {
        console.log('Rota compliance check:', compliance);
        
        // Update attendance record with rota information
        await supabase
          .from('attendance')
          .update({ 
            notes: `${data.notes || ''} | Rota Compliance: ${compliance.message}`.trim()
          })
          .eq('id', data.id);

        // Show appropriate toast based on compliance
        if (!compliance.is_compliant) {
          toast({
            title: "Late Clock-In Recorded",
            description: `${compliance.message}. This has been recorded against your rota schedule.`,
            variant: "destructive",
          });
        } else {
          const timeInfo = compliance.scheduled_time 
            ? ` (Scheduled: ${compliance.scheduled_time})`
            : '';
          toast({
            title: "Clocked In Successfully",
            description: `${compliance.message}${timeInfo}`,
          });
        }
      } else {
        // Fallback message if rota compliance check fails
        toast({
          title: "Clocked In Successfully",
          description: `You clocked in at ${format(now, 'h:mm a')}. Note: This is not a rota shift - standard attendance tracking applied.`,
        });
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an unexpected error while clocking in",
        variant: "destructive",
      });
    }
  };

  const getDayShiftPattern = (employeeData: any, dayOfWeek: number) => {
    const dayMapping = [
      'sunday_shift_id',    // 0
      'monday_shift_id',    // 1
      'tuesday_shift_id',   // 2
      'wednesday_shift_id', // 3
      'thursday_shift_id',  // 4
      'friday_shift_id',    // 5
      'saturday_shift_id'   // 6
    ];
    
    return employeeData[dayMapping[dayOfWeek]];
  };

  return { handleClockIn };
};
