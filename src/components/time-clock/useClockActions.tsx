
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
    
    // Get employee's current status from database
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: attendanceRecords, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .eq('active_session', true)
        .order('check_in', { ascending: false })
        .limit(1);

      if (error) throw error;

      const activeRecord = attendanceRecords && attendanceRecords.length > 0 ? attendanceRecords[0] : null;
      
      if (activeRecord) {
        setEmployeeStatus({
          attendanceId: activeRecord.id,
          isClockedIn: true,
          onBreak: activeRecord.on_break || false,
          checkInTime: activeRecord.check_in,
          breakStartTime: activeRecord.break_start
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
    selectedEmployee,
    action,
    isProcessing,
    employeeStatus,
    handleSelectEmployee,
    handleClockAction,
    handleBreakAction
  };
};
