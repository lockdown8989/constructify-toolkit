
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeStatus {
  attendanceId: string | null;
  isClockedIn: boolean;
  onBreak: boolean;
  checkInTime: string | null;
  breakStartTime: string | null;
}

export const useEmployeeSelection = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus | null>(null);

  const handleSelectEmployee = async (employeeId: string) => {
    setSelectedEmployee(employeeId);
    
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

  return {
    selectedEmployee,
    employeeStatus,
    handleSelectEmployee,
    setEmployeeStatus
  };
};
