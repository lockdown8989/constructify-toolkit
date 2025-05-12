
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

export const setupEmployeeSalary = async (employee: Employee) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // First day of current month
    
    // Check if salary record for current month already exists
    const { data: existingRecord } = await supabase
      .from('salary_statistics')
      .select('id')
      .eq('employee_id', employee.id)
      .eq('month', currentMonth)
      .single();
      
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('salary_statistics')
        .update({
          base_salary: employee.salary,
          payment_status: 'Pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);
        
      if (error) throw error;
    } else {
      // Create new salary record
      const { data, error } = await supabase
        .from('salary_statistics')
        .insert({
          employee_id: employee.id,
          month: currentMonth,
          base_salary: employee.salary,
          payment_status: 'Pending',
          net_salary: null, // Will be calculated during payroll processing
          deductions: 0,
          bonus: 0
        });
        
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up employee salary:', error);
    throw error;
  }
};

// Calculate salary based on attendance, leave, and contract terms
export const calculateSalary = async (employeeId: string, month: string) => {
  try {
    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    // Get attendance records for the month
    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0); // Last day of month
    
    const startDate = monthStart.toISOString().split('T')[0];
    const endDate = monthEnd.toISOString().split('T')[0];
    
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (attendanceError) throw attendanceError;
    
    // Get leave records for the month
    const { data: leaveRecords, error: leaveError } = await supabase
      .from('leave_calendar')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'Approved')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
      
    if (leaveError) throw leaveError;
    
    // Calculate working days, leaves, absences
    const totalDaysInMonth = monthEnd.getDate();
    const workingDays = attendanceRecords?.filter(r => r.attendance_status === 'Present' || r.attendance_status === 'Approved').length || 0;
    const leaveDays = attendanceRecords?.filter(r => r.attendance_status === 'On Leave').length || 0;
    const absentDays = attendanceRecords?.filter(r => r.attendance_status === 'Absent').length || 0;
    
    // Calculate total working minutes and overtime
    const totalWorkingMinutes = attendanceRecords?.reduce((sum, record) => sum + (record.working_minutes || 0), 0) || 0;
    const totalOvertimeMinutes = attendanceRecords?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) || 0;
    
    // Calculate total pay
    const baseSalary = employee.salary;
    const dailyRate = baseSalary / 22; // Assuming 22 working days in a month
    const hourlyRate = employee.hourly_rate || (baseSalary / 22 / 8); // 8 hours per day
    
    // Calculate deductions for absences
    const absenceDeduction = absentDays * dailyRate;
    
    // Calculate overtime pay
    const overtimePay = (totalOvertimeMinutes / 60) * hourlyRate * 1.5; // 1.5x for overtime
    
    // Calculate net salary
    const netSalary = baseSalary - absenceDeduction + overtimePay;
    
    // Update salary statistics
    const { data, error } = await supabase
      .from('salary_statistics')
      .update({
        net_salary: netSalary,
        deductions: absenceDeduction,
        updated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .eq('month', month.substring(0, 10));
      
    if (error) throw error;
    
    return {
      success: true,
      baseSalary,
      netSalary,
      deductions: absenceDeduction,
      overtimePay,
      workingDays,
      leaveDays,
      absentDays,
      totalWorkingHours: totalWorkingMinutes / 60,
      totalOvertimeHours: totalOvertimeMinutes / 60
    };
  } catch (error) {
    console.error('Error calculating salary:', error);
    throw error;
  }
};

// Recalculate salary after employee role or level change
export const recalculateSalary = async (employeeId: string) => {
  try {
    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    // Calculate salary for current month
    const result = await calculateSalary(employeeId, currentMonth);
    
    // Get employee details for notification
    const { data: employee } = await supabase
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();
    
    if (employee?.user_id) {
      await import('../notifications/notification-sender').then(module => 
        module.sendNotification({
          user_id: employee.user_id,
          title: 'Salary Recalculated',
          message: `Your salary has been recalculated based on your updated information. New salary: ${result.netSalary.toFixed(2)}`,
          type: 'info',
          related_entity: 'salary'
        })
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error recalculating salary:', error);
    throw error;
  }
};
