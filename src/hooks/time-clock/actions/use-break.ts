
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TimeClockStatus } from '../types';

export const useBreak = (
  setStatus: (status: TimeClockStatus) => void
) => {
  const { toast } = useToast();

  const handleBreakStart = async (currentRecord: string | null) => {
    if (!currentRecord) {
      toast({
        title: "❌ Error",
        description: "No active session to start break",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      
      const { error } = await supabase
        .from('attendance')
        .update({
          on_break: true,
          break_start: now.toISOString(),
          current_status: 'on-break'
        })
        .eq('id', currentRecord);

      if (error) {
        console.error('Error starting break:', error);
        toast({
          title: "❌ Error Starting Break",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setStatus('on-break');
      
      toast({
        title: "☕ Break Started",
        description: `You started your break at ${format(now, 'h:mm a')}. Take your time!`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error in handleBreakStart:', error);
      toast({
        title: "❌ Error",
        description: "There was an unexpected error while starting break",
        variant: "destructive",
      });
    }
  };

  const handleBreakEnd = async (currentRecord: string | null) => {
    if (!currentRecord) {
      toast({
        title: "❌ Error",
        description: "No active session to end break",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      
      // Get the current break start time and existing break minutes
      const { data: currentData, error: fetchError } = await supabase
        .from('attendance')
        .select('break_start, break_minutes')
        .eq('id', currentRecord)
        .single();

      if (fetchError) {
        console.error('Error fetching break data:', fetchError);
        throw fetchError;
      }

      if (!currentData?.break_start) {
        toast({
          title: "❌ Error",
          description: "No active break to end",
          variant: "destructive",
        });
        return;
      }

      const breakStartTime = new Date(currentData.break_start);
      const currentBreakMinutes = Math.round((now.getTime() - breakStartTime.getTime()) / (1000 * 60));
      const totalBreakMinutes = (currentData.break_minutes || 0) + currentBreakMinutes;

      const { error } = await supabase
        .from('attendance')
        .update({
          on_break: false,
          break_start: null,
          break_minutes: totalBreakMinutes,
          current_status: 'clocked-in'
        })
        .eq('id', currentRecord);

      if (error) {
        console.error('Error ending break:', error);
        toast({
          title: "❌ Error Ending Break",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setStatus('clocked-in');
      
      toast({
        title: "🎯 Break Ended",
        description: `Welcome back! Your break lasted ${currentBreakMinutes} minutes. Back to work at ${format(now, 'h:mm a')}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error in handleBreakEnd:', error);
      toast({
        title: "❌ Error",
        description: "There was an unexpected error while ending break",
        variant: "destructive",
      });
    }
  };

  return { handleBreakStart, handleBreakEnd };
};
