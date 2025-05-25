import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeStatus {
  attendanceId: string | null;
  isClockedIn: boolean;
  onBreak: boolean;
  checkInTime: string | null;
  breakStartTime: string | null;
}

export const useClockActions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus | null>(null);
  const { toast } = useToast();

  const handleSelectEmployee = async (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setAction(null);
    
    // Get employee's current status
    try {
      const { data, error } = await supabase.rpc('get_employee_attendance_status', {
        p_employee_id: employeeId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const status = data[0];
        setEmployeeStatus({
          attendanceId: status.attendance_id,
          isClockedIn: status.is_clocked_in,
          onBreak: status.on_break,
          checkInTime: status.check_in_time,
          breakStartTime: status.break_start_time
        });
      } else {
        setEmployeeStatus({
          attendanceId: null,
          isClockedIn: false,
          onBreak: false,
          checkInTime: null,
          breakStartTime: null
        });
      }
    } catch (error) {
      console.error('Error fetching employee status:', error);
      setEmployeeStatus(null);
    }
  };

  const handleClockAction = async (actionType: 'in' | 'out') => {
    if (!selectedEmployee) return;

    setIsProcessing(true);
    setAction(actionType);

    try {
      if (actionType === 'in') {
        // Clock in the employee
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            employee_id: selectedEmployee,
            check_in: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            active_session: true,
            manager_initiated: true,
            attendance_status: 'Present'
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
            break_start: null
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

  const handleBreakAction = async (actionType: 'start' | 'end') => {
    if (!selectedEmployee || !employeeStatus?.attendanceId) return;

    setIsProcessing(true);

    try {
      if (actionType === 'start') {
        const { data, error } = await supabase.rpc('start_employee_break', {
          p_attendance_id: employeeStatus.attendanceId
        });

        if (error) throw error;

        setEmployeeStatus({
          ...employeeStatus,
          onBreak: true,
          breakStartTime: new Date().toISOString()
        });

      } else if (actionType === 'end') {
        const { data, error } = await supabase.rpc('end_employee_break', {
          p_attendance_id: employeeStatus.attendanceId
        });

        if (error) throw error;

        setEmployeeStatus({
          ...employeeStatus,
          onBreak: false,
          breakStartTime: null
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
    selectedEmployee,
    action,
    isProcessing,
    employeeStatus,
    handleSelectEmployee,
    handleClockAction,
    handleBreakAction
  };
};
