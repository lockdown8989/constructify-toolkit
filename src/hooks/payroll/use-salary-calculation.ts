
import { supabase } from '@/integrations/supabase/client';

export interface AttendanceData {
  workingHours: number;
  overtimeHours: number;
  totalPay: number;
}

export const getEmployeeAttendance = async (employeeId: string): Promise<AttendanceData> => {
  try {
    // Get employee attendance data for the current month
    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    
    const { data, error } = await supabase
      .from('attendance')
      .select('working_minutes, overtime_minutes')
      .eq('employee_id', employeeId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // Calculate total working and overtime hours
    let totalWorkingMinutes = 0;
    let totalOvertimeMinutes = 0;
    
    if (data && data.length > 0) {
      data.forEach(record => {
        totalWorkingMinutes += record.working_minutes || 0;
        totalOvertimeMinutes += record.overtime_minutes || 0;
      });
    }
    
    // Convert minutes to hours
    const workingHours = parseFloat((totalWorkingMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((totalOvertimeMinutes / 60).toFixed(2));
    
    // Default total pay - this will be calculated properly later
    const totalPay = 0;
    
    return {
      workingHours,
      overtimeHours,
      totalPay
    };
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    // Return default values if there's an error
    return {
      workingHours: 0,
      overtimeHours: 0,
      totalPay: 0
    };
  }
};

export const calculateSalaryWithGPT = async (
  employeeId: string,
  baseSalary: number,
  currency: string
): Promise<number> => {
  try {
    // Get employee's attendance data
    const attendance = await getEmployeeAttendance(employeeId);
    
    // Call the Supabase Edge Function that uses OpenAI API
    const { data: response, error } = await supabase.functions.invoke('calculate-salary', {
      body: {
        employeeId,
        baseSalary,
        currency,
        workingHours: attendance.workingHours,
        overtimeHours: attendance.overtimeHours
      }
    });
    
    if (error) {
      console.error('Error calling calculate-salary function:', error);
      throw new Error(`Failed to calculate salary: ${error.message}`);
    }
    
    if (!response || !response.finalSalary) {
      console.error('Invalid response from calculate-salary function:', response);
      throw new Error('Failed to get a valid salary calculation');
    }
    
    console.log(`Calculated salary for employee ${employeeId}: ${response.finalSalary} ${currency}`);
    
    return response.finalSalary;
    
  } catch (error) {
    console.error('Error calculating salary with GPT:', error);
    
    // Fallback to basic calculation if API call fails
    const attendance = await getEmployeeAttendance(employeeId);
    
    // Calculate standard working hours per month (assuming 40 hour work week, 4 weeks)
    const standardMonthlyHours = 160;
    
    // Calculate hourly rate
    const hourlyRate = baseSalary / standardMonthlyHours;
    
    // Calculate regular pay
    const regularPay = hourlyRate * (attendance.workingHours || standardMonthlyHours);
    
    // Calculate overtime pay (1.5x regular rate)
    const overtimePay = hourlyRate * 1.5 * (attendance.overtimeHours || 0);
    
    // Calculate total salary (before deductions)
    const totalSalary = regularPay + overtimePay;
    
    // Calculate estimated tax and insurance (simplified)
    const taxRate = 0.2; // 20% tax
    const insuranceRate = 0.05; // 5% insurance
    const otherRate = 0.08; // 8% other deductions
    
    const taxDeduction = totalSalary * taxRate;
    const insuranceDeduction = totalSalary * insuranceRate;
    const otherDeduction = totalSalary * otherRate;
    
    // Calculate final salary after deductions
    const finalSalary = totalSalary - (taxDeduction + insuranceDeduction + otherDeduction);
    
    return parseFloat(finalSalary.toFixed(2));
  }
};
