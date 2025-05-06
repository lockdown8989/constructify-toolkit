
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/dashboard/salary-table/types';
import { calculateSalaryWithGPT, getEmployeeAttendance } from './use-salary-calculation';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import { sendNotification } from '@/services/notifications/notification-sender';
import { notifyEmployeeAboutPayslip } from '@/services/notifications/payroll-notifications';
import { format } from 'date-fns';

export const processEmployeePayroll = async (
  employeeId: string, 
  employee: Employee, 
  currency: string = 'GBP'
) => {
  try {
    // Get employee attendance data for accurate calculation
    const { workingHours, overtimeHours } = await getEmployeeAttendance(employeeId);
    
    // Get employee details from the profile table for more accurate info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name, country')
      .eq('id', employee.user_id)
      .single();
    
    // Extract numeric salary value
    let baseSalary: number;
    if (typeof employee.salary === 'string') {
      // Remove currency symbols and commas
      baseSalary = parseFloat(String(employee.salary).replace(/[^\d.]/g, ''));
      if (isNaN(baseSalary)) {
        baseSalary = 0; // Default to 0 if parsing fails
      }
    } else if (typeof employee.salary === 'number') {
      baseSalary = employee.salary;
    } else {
      baseSalary = 0; // Default case
    }
    
    // Calculate final salary using AI function with currency
    const finalSalary = await calculateSalaryWithGPT(employeeId, baseSalary, currency);
    
    // Determine tax, insurance and other deductions
    const taxRate = 0.2;
    const insuranceRate = 0.05;
    const otherRate = 0.08;
    const taxDeduction = baseSalary * taxRate;
    const insuranceDeduction = baseSalary * insuranceRate;
    const otherDeduction = baseSalary * otherRate;
    const totalDeductions = taxDeduction + insuranceDeduction + otherDeduction;
    
    // Calculate overtime pay
    const hourlyRate = baseSalary / 160; // Assuming 160 hours per month
    const overtimePay = overtimeHours * hourlyRate * 1.5; // Overtime rate of 1.5x
    
    const paymentDate = new Date().toISOString().split('T')[0];
    const processingDate = new Date().toISOString();
    
    // Generate pay period
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const payPeriod = `${format(firstDayOfMonth, 'dd/MM/yyyy')} - ${format(lastDayOfMonth, 'dd/MM/yyyy')}`;
    
    // Add record to payroll table
    const { data: payrollData, error: payrollError } = await supabase
      .from('payroll')
      .insert({
        employee_id: employeeId,
        base_pay: baseSalary,
        working_hours: workingHours,
        overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        salary_paid: finalSalary,
        deductions: totalDeductions,
        tax_paid: taxDeduction,
        ni_contribution: insuranceDeduction,
        other_deductions: otherDeduction,
        payment_status: 'Paid',
        payment_date: paymentDate,
        processing_date: processingDate
      })
      .select()
      .single();

    if (payrollError) throw payrollError;
    
    // Generate PDF payslip
    try {
      const employeeName = employee.name || `${profileData?.first_name || ''} ${profileData?.last_name || ''}`;
      
      const pdfResult = await generatePayslipPDF(
        employeeId, 
        {
          name: employeeName,
          title: employee.title || 'Employee',
          salary: baseSalary.toString(),
          department: employee.department || 'General',
          paymentDate: format(new Date(), 'dd/MM/yyyy'),
          currency,
          employeeId,
          address: employee.location || '',
          payPeriod,
          overtimeHours,
          contractualHours: workingHours
        },
        true // Upload to storage
      );
      
      // Send notification to the employee
      if (employee.user_id) {
        await notifyEmployeeAboutPayslip(
          employeeId,
          employee.user_id,
          finalSalary,
          currency,
          paymentDate
        );
      }
      
    } catch (pdfError) {
      console.error('Error generating payslip PDF:', pdfError);
      // Continue as PDF generation is non-critical
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in processEmployeePayroll:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Record payroll processing history
export const savePayrollHistory = async (
  employeeIds: string[],
  successCount: number,
  failCount: number,
  processedBy: string
) => {
  try {
    const { error } = await supabase
      .from('payroll_history')
      .insert({
        employee_count: employeeIds.length,
        success_count: successCount,
        fail_count: failCount,
        processed_by: processedBy,
        employee_ids: employeeIds,
        processing_date: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error saving payroll history:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception in savePayrollHistory:', err);
    return false;
  }
};
