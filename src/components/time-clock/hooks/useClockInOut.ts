
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmployeeStatus } from './useEmployeeSelection';

export const useClockInOut = (
  selectedEmployee: string | null,
  employeeStatus: EmployeeStatus | null,
  setEmployeeStatus: (status: EmployeeStatus | null) => void
) => {
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleClockAction = async (actionType: 'in' | 'out') => {
    if (!selectedEmployee) return;

    setIsProcessing(true);
    setAction(actionType);

    try {
      if (actionType === 'in') {
        // Clock in the employee
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: selectedEmployee,
            check_in: now.toISOString(),
            date: today,
            active_session: true,
            manager_initiated: true,
            attendance_status: 'Present',
            current_status: 'clocked-in'
          })
          .select()
          .single();

        if (error) throw error;

        setEmployeeStatus({
          attendanceId: data.id,
          isClockedIn: true,
          onBreak: false,
          checkInTime: data.check_in,
          breakStartTime: null
        });

        toast({
          title: "Employee Clocked In",
          description: "Employee has been successfully clocked in.",
        });

      } else if (actionType === 'out') {
        // Clock out the employee
        if (!employeeStatus?.attendanceId) throw new Error('No active session found');

        const now = new Date();
        const { data: attendanceData, error: fetchError } = await supabase
          .from('attendance')
          .select('check_in, break_minutes, on_break, break_start')
          .eq('id', employeeStatus.attendanceId)
          .single();

        if (fetchError) throw fetchError;

        const checkInTime = new Date(attendanceData.check_in);
        let totalWorkingMinutes = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60));
        
        // If on break, add current break time to total break minutes
        let totalBreakMinutes = attendanceData.break_minutes || 0;
        if (attendanceData.on_break && attendanceData.break_start) {
          const currentBreakMinutes = Math.round((now.getTime() - new Date(attendanceData.break_start).getTime()) / (1000 * 60));
          totalBreakMinutes += currentBreakMinutes;
        }

        // Subtract total break time from working time
        const actualWorkingMinutes = Math.max(0, totalWorkingMinutes - totalBreakMinutes);
        const overtimeMinutes = Math.max(0, actualWorkingMinutes - 480); // Over 8 hours
        const regularMinutes = actualWorkingMinutes - overtimeMinutes;

        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out: now.toISOString(),
            active_session: false,
            on_break: false,
            working_minutes: regularMinutes,
            overtime_minutes: overtimeMinutes,
            break_minutes: totalBreakMinutes,
            break_start: null,
            current_status: 'clocked-out'
          })
          .eq('id', employeeStatus.attendanceId);

        if (updateError) throw updateError;

        setEmployeeStatus({
          attendanceId: null,
          isClockedIn: false,
          onBreak: false,
          checkInTime: null,
          breakStartTime: null
        });

        toast({
          title: "Employee Clocked Out",
          description: "Employee has been successfully clocked out.",
        });
      }

    } catch (error) {
      console.error('Error in clock action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  return {
    action,
    isProcessing,
    handleClockAction
  };
};
