
import { supabase } from '@/integrations/supabase/client';

export interface AttendanceData {
  workingHours: number;
  overtimeHours: number;
  totalPay: number;
}

// UK Tax Rates for 2024/2025
const UK_TAX_RATES = {
  personalAllowance: 12570,
  basicRateUpper: 50270,
  higherRateUpper: 125140,
  basicRate: 0.2,      // 20%
  higherRate: 0.4,     // 40%
  additionalRate: 0.45 // 45%
};

// Calculate UK income tax based on annual salary
export function calculateUKIncomeTax(annualSalary: number): number {
  let taxDue = 0;
  
  // No personal allowance for very high earners (reducing by £1 for every £2 over £100,000)
  const personalAllowance = annualSalary > 125140 ? 0 : 
                           annualSalary > 100000 ? Math.max(0, UK_TAX_RATES.personalAllowance - (annualSalary - 100000) / 2) : 
                           UK_TAX_RATES.personalAllowance;
  
  // Calculate tax for each band
  if (annualSalary > personalAllowance) {
    // Basic rate (20%)
    const basicRateTaxable = Math.min(UK_TAX_RATES.basicRateUpper - personalAllowance, annualSalary - personalAllowance);
    if (basicRateTaxable > 0) {
      taxDue += basicRateTaxable * UK_TAX_RATES.basicRate;
    }
    
    // Higher rate (40%)
    if (annualSalary > UK_TAX_RATES.basicRateUpper) {
      const higherRateTaxable = Math.min(UK_TAX_RATES.higherRateUpper - UK_TAX_RATES.basicRateUpper, 
                                      annualSalary - UK_TAX_RATES.basicRateUpper);
      if (higherRateTaxable > 0) {
        taxDue += higherRateTaxable * UK_TAX_RATES.higherRate;
      }
      
      // Additional rate (45%)
      if (annualSalary > UK_TAX_RATES.higherRateUpper) {
        const additionalRateTaxable = annualSalary - UK_TAX_RATES.higherRateUpper;
        taxDue += additionalRateTaxable * UK_TAX_RATES.additionalRate;
      }
    }
  }
  
  // Return annual tax
  return taxDue;
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
    
    // Fallback to UK tax calculation if API call fails
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
    const grossSalary = regularPay + overtimePay;
    
    // Calculate annual equivalent for tax purposes (monthly * 12)
    const annualEquivalent = baseSalary * 12;
    
    // Calculate tax using UK rates (annual amount then convert to monthly)
    const annualTax = calculateUKIncomeTax(annualEquivalent);
    const monthlyTaxRate = annualTax / annualEquivalent; // effective tax rate
    const taxDeduction = grossSalary * monthlyTaxRate; // apply to this month's gross salary
    
    // Calculate estimated insurance and other deductions
    const insuranceRate = 0.05; // 5% insurance/NI
    const otherRate = 0.08; // 8% other deductions
    
    const insuranceDeduction = grossSalary * insuranceRate;
    const otherDeduction = grossSalary * otherRate;
    
    // Calculate final salary after deductions
    const finalSalary = grossSalary - (taxDeduction + insuranceDeduction + otherDeduction);
    
    return parseFloat(finalSalary.toFixed(2));
  }
};
