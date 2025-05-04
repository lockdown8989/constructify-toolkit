import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAttendanceMetadata } from '../use-attendance-metadata';

export const useBreak = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void
) => {
  const { toast } = useToast();
  const { location, deviceInfo } = useAttendanceMetadata();

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

  return { handleBreakStart, handleBreakEnd };
};
