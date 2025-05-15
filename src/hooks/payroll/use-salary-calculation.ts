
import { supabase } from '@/integrations/supabase/client';

// Fetch employee attendance data
export const getEmployeeAttendance = async (employeeId: string) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const now = new Date();
    
    // Get attendance records for the current month
    const { data, error } = await supabase
      .from('attendance')
      .select('working_minutes, overtime_minutes')
      .eq('employee_id', employeeId)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', now.toISOString().split('T')[0]);
      
    if (error) throw error;
    
    let totalWorkingMinutes = 0;
    let totalOvertimeMinutes = 0;
    
    // Sum up all working and overtime minutes
    if (data && data.length > 0) {
      data.forEach(record => {
        totalWorkingMinutes += record.working_minutes || 0;
        totalOvertimeMinutes += record.overtime_minutes || 0;
      });
    }
    
    // Convert minutes to hours
    const workingHours = parseFloat((totalWorkingMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((totalOvertimeMinutes / 60).toFixed(2));
    
    return { workingHours, overtimeHours };
  } catch (error) {
    console.error('Error getting employee attendance:', error);
    return { workingHours: 0, overtimeHours: 0 };
  }
};

// Call the GPT salary calculation function or simulate it
export const calculateSalaryWithGPT = async (employeeId: string, baseSalary: number, currency: string) => {
  try {
    // For real implementation, this would call a Supabase Edge Function with GPT
    // For now, we'll simulate a calculation based on the base salary

    // Get the attendance data
    const { workingHours, overtimeHours } = await getEmployeeAttendance(employeeId);
    
    // Let's assume a standard month is 160 working hours
    const standardHours = 160;
    const hourlyRate = baseSalary / standardHours;
    
    // Calculate base pay based on actual hours worked
    const actualWorkPay = Math.min(workingHours, standardHours) * hourlyRate;
    
    // Calculate overtime pay (1.5x regular rate)
    const overtimePay = overtimeHours * (hourlyRate * 1.5);
    
    // Apply deductions (tax, insurance, etc.)
    const deductionRate = 0.3; // 30% total deductions
    const deductions = baseSalary * deductionRate;
    
    // Calculate final salary
    let finalSalary = Math.max(0, actualWorkPay + overtimePay - deductions);

    // Round to 2 decimal places
    finalSalary = Math.round(finalSalary * 100) / 100;
    
    return finalSalary;
  } catch (error) {
    console.error('Error calculating salary with GPT:', error);
    // Return a default fallback calculation
    return baseSalary * 0.7; // Simple 30% deduction as fallback
  }
};
