
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { debugTimeInfo } from '@/utils/timezone-utils';

export const useBreak = (
  setStatus: (status: 'clocked-in' | 'clocked-out' | 'on-break') => void
) => {
  const { toast } = useToast();

  const handleBreakStart = async (currentRecord: string | null) => {
    if (!currentRecord) {
      toast({
        title: "Error",
        description: "No active session to start break from",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      // Log time information for debugging
      debugTimeInfo('Break start time', now);
      
      // Update the record with break start time, set on_break flag and current_status
      const { error } = await supabase
        .from('attendance')
        .update({
          break_start: now.toISOString(),
          on_break: true,
          current_status: 'on-break' // Explicitly set the current status
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

      console.log('Break started successfully at:', now.toLocaleString());
      setStatus('on-break');
      toast({
        title: "Break Started",
        description: `Break started at ${format(now, 'h:mm a')}`,
      });
    } catch (error) {
      console.error('Error in handleBreakStart:', error);
      toast({
        title: "Error",
        description: "There was an unexpected error while starting your break",
        variant: "destructive",
      });
    }
  };

  const handleBreakEnd = async (currentRecord: string | null) => {
    if (!currentRecord) {
      toast({
        title: "Error",
        description: "No active break to end",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get break start time to calculate duration
      const { data: recordData, error: fetchError } = await supabase
        .from('attendance')
        .select('break_start, break_minutes')
        .eq('id', currentRecord)
        .single();
        
      if (fetchError) {
        console.error('Error fetching break data:', fetchError);
        throw fetchError;
      }
      
      if (!recordData.break_start) {
        toast({
          title: "Error",
          description: "No break start time found",
          variant: "destructive",
        });
        return;
      }
      
      const now = new Date();
      // Log time information for debugging
      debugTimeInfo('Break end time', now);
      console.log('Break start time from DB:', recordData.break_start);
      
      const breakStartTime = new Date(recordData.break_start);
      console.log('Parsed break start time:', breakStartTime.toLocaleString());
      
      // Calculate break duration preserving timezone information
      const currentBreakMinutes = Math.round((now.getTime() - breakStartTime.getTime()) / (1000 * 60));
      const totalBreakMinutes = (recordData.break_minutes || 0) + currentBreakMinutes;
      
      // Update the record with break end calculation and current_status
      const { error } = await supabase
        .from('attendance')
        .update({
          break_start: null,
          on_break: false,
          current_status: 'clocked-in', // Explicitly set back to clocked-in
          break_minutes: totalBreakMinutes
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

      console.log('Break ended successfully. Duration:', currentBreakMinutes, 'minutes');
      setStatus('clocked-in');
      toast({
        title: "Break Ended",
        description: `Break ended after ${currentBreakMinutes} minutes`,
      });
    } catch (error) {
      console.error('Error in handleBreakEnd:', error);
      toast({
        title: "Error",
        description: "There was an unexpected error while ending your break",
        variant: "destructive",
      });
    }
  };

  return { handleBreakStart, handleBreakEnd };
};
