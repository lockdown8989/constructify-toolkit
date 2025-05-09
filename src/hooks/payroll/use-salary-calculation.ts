
import { supabase } from '@/integrations/supabase/client';

export const getEmployeeAttendance = async (employeeId: string) => {
  try {
    // Get the current month's attendance records
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const { data } = await supabase
      .from('attendance')
      .select('working_minutes, overtime_minutes')
      .eq('employee_id', employeeId)
      .gte('date', firstDay.toISOString().split('T')[0])
      .lte('date', lastDay.toISOString().split('T')[0]);
      
    // Calculate total hours
    const workingMinutes = data?.reduce((sum, record) => sum + (record.working_minutes || 0), 0) || 0;
    const overtimeMinutes = data?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) || 0;
    
    return {
      workingHours: workingMinutes / 60,
      overtimeHours: overtimeMinutes / 60
    };
  } catch (error) {
    console.error('Error getting employee attendance:', error);
    return {
      workingHours: 160, // Default full-time hours
      overtimeHours: 0
    };
  }
};

export const calculateSalaryWithGPT = async (employeeId: string, baseSalary: number, currency: string) => {
  try {
    // Get employee hourly rate if available
    const { data: employee } = await supabase
      .from('employees')
      .select('hourly_rate, salary')
      .eq('id', employeeId)
      .single();
      
    // Get attendance data
    const { workingHours, overtimeHours } = await getEmployeeAttendance(employeeId);
    
    // If hourly rate is available, use it to calculate salary
    if (employee?.hourly_rate) {
      const hourlyRate = employee.hourly_rate;
      const regularPay = hourlyRate * workingHours;
      const overtimePay = hourlyRate * 1.5 * overtimeHours;
      return regularPay + overtimePay;
    }
    
    // If no hourly rate, use monthly salary and adjust for overtime
    const hourlyEquivalent = baseSalary / (160); // 160 hours per month assumption
    const overtimePay = hourlyEquivalent * 1.5 * overtimeHours;
    
    return baseSalary + overtimePay;
  } catch (error) {
    console.error('Error calculating salary:', error);
    return baseSalary; // Return base salary as fallback
  }
};
