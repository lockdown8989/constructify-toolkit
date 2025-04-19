import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TimeClockStatus } from './types';

export const useTimeClockActions = (
  setStatus: (status: TimeClockStatus) => void,
  setCurrentRecord: (record: string | null) => void
) => {
  const { toast } = useToast();

  const handleClockIn = async (employeeId: string | undefined) => {
    if (!employeeId) return;

    const now = new Date();
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        check_in: now.toISOString(),
        date: now.toISOString().split('T')[0],
        status: 'Present'
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

    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString()
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
    
    const now = new Date();
    const { error } = await supabase
      .from('attendance')
      .update({
        break_start: now.toISOString()
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
    
    const now = new Date();
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

    if (record?.break_start) {
      const breakStart = new Date(record.break_start);
      const existingBreakMinutes = record.break_minutes || 0;
      const newBreakMinutes = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60)) + existingBreakMinutes;

      const { error } = await supabase
        .from('attendance')
        .update({
          break_minutes: newBreakMinutes,
          break_start: null
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
