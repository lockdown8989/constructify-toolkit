import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TimeClockStatus } from './types';
import { useAttendanceMetadata } from './use-attendance-metadata';
import { v4 as uuidv4 } from 'uuid';

export const useTimeClockActions = (
  setStatus: (status: TimeClockStatus) => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

  // Generate a persistent device identifier
  const getDeviceIdentifier = () => {
    // Use existing device ID from local storage if available
    let deviceId = localStorage.getItem('device_identifier');
    
    // If not found, create a new one
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('device_identifier', deviceId);
    }
    
    return deviceId;
  };

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

  const handleBreakStart = async (currentRecord: string | null) => {
    if (!currentRecord) return;
    
    console.log('Starting break with record ID:', currentRecord);
    
    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        break_start: now.toISOString(),
        location,
        device_info: deviceInfo
        // Keep active_session as true during breaks
      })
      .eq('id', currentRecord);

    if (error) {
      console.error('Error starting break:', error);
      toast({
        title: "Error Starting Break",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setStatus('on-break');
    toast({
      title: "Break Started",
      description: `Your break started at ${format(now, 'h:mm a')}`,
    });
  };

  const handleBreakEnd = async (currentRecord: string | null) => {
    if (!currentRecord) return;
    
    console.log('Ending break with record ID:', currentRecord);
    
    // First, retrieve the current break details to calculate duration
    const { data: record, error: fetchError } = await supabase
      .from('attendance')
      .select('break_start, break_minutes')
      .eq('id', currentRecord)
      .single();

    if (fetchError) {
      console.error('Error fetching break start time:', fetchError);
      toast({
        title: "Error Ending Break",
        description: fetchError.message,
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    
    if (record?.break_start) {
      const breakStart = new Date(record.break_start);
      const existingBreakMinutes = record.break_minutes || 0;
      const newBreakMinutes = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60)) + existingBreakMinutes;

      console.log('Break details:', {
        breakStart,
        existingBreakMinutes,
        newBreakMinutes,
        currentRecord
      });

      const { error } = await supabase
        .from('attendance')
        .update({
          break_minutes: newBreakMinutes,
          break_start: null,
          location,
          device_info: deviceInfo
          // Keep active_session as true
        })
        .eq('id', currentRecord);

      if (error) {
        console.error('Error ending break:', error);
        toast({
          title: "Error Ending Break",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setStatus('clocked-in');
    toast({
      title: "Break Ended",
      description: `Your break ended at ${format(now, 'h:mm a')}`,
    });
  };

  return {
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd
  };
};
