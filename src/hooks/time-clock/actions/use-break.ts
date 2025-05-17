
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
      console.log('Break start time (local):', now.toLocaleString());
      console.log('Break start time (ISO):', now.toISOString());
      
      // Update the record with break start time using ISO string
      const { error } = await supabase
        .from('attendance')
        .update({
          break_start: now.toISOString(), // Store as ISO string to preserve timezone information
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
        .select('break_start')
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
      console.log('Break end time (local):', now.toLocaleString());
      console.log('Break start time from DB:', recordData.break_start);
      
      const breakStartTime = new Date(recordData.break_start);
      console.log('Parsed break start time:', breakStartTime.toLocaleString());
      
      // Calculate break duration preserving timezone information
      const breakMinutes = Math.round((now.getTime() - breakStartTime.getTime()) / (1000 * 60));
      
      // Update the record with break end calculation
      const { error } = await supabase
        .from('attendance')
        .update({
          break_start: null,
          break_minutes: breakMinutes
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

      setStatus('clocked-in');
      toast({
        title: "Break Ended",
        description: `Break ended after ${breakMinutes} minutes`,
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
