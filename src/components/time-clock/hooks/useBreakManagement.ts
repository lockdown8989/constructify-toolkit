
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmployeeStatus } from './useEmployeeSelection';

export const useBreakManagement = (
  selectedEmployee: string | null,
  employeeStatus: EmployeeStatus | null,
  setEmployeeStatus: (status: EmployeeStatus | null) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleBreakAction = async (actionType: 'start' | 'end') => {
    if (!selectedEmployee || !employeeStatus?.attendanceId) return;

    setIsProcessing(true);

    try {
      if (actionType === 'start') {
        const { error } = await supabase
          .from('attendance')
          .update({
            break_start: new Date().toISOString(),
            on_break: true,
            current_status: 'on-break'
          })
          .eq('id', employeeStatus.attendanceId);

        if (error) throw error;

        setEmployeeStatus({
          ...employeeStatus,
          onBreak: true,
          breakStartTime: new Date().toISOString()
        });

        toast({
          title: "Break Started",
          description: "Employee break has been started.",
        });

      } else if (actionType === 'end') {
        // Calculate break duration and add to total break minutes
        const { data: currentData, error: fetchError } = await supabase
          .from('attendance')
          .select('break_start, break_minutes')
          .eq('id', employeeStatus.attendanceId)
          .single();

        if (fetchError) throw fetchError;

        const breakDuration = Math.round((new Date().getTime() - new Date(currentData.break_start).getTime()) / (1000 * 60));
        const totalBreakMinutes = (currentData.break_minutes || 0) + breakDuration;

        const { error } = await supabase
          .from('attendance')
          .update({
            break_start: null,
            on_break: false,
            break_minutes: totalBreakMinutes,
            current_status: 'clocked-in'
          })
          .eq('id', employeeStatus.attendanceId);

        if (error) throw error;

        setEmployeeStatus({
          ...employeeStatus,
          onBreak: false,
          breakStartTime: null
        });

        toast({
          title: "Break Ended",
          description: "Employee break has been ended.",
        });
      }

    } catch (error) {
      console.error('Error in break action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleBreakAction,
    isBreakProcessing: isProcessing
  };
};
