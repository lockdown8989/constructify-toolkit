
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/dashboard/salary-table/types';
import { calculateSalaryWithGPT, getEmployeeAttendance } from './use-salary-calculation';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import { sendNotification } from '@/services/notifications/notification-sender';

export const processEmployeePayroll = async (
  employeeId: string, 
  employee: Employee, 
  currency: string = 'GBP'
) => {
  // Get employee attendance data for accurate calculation
  const { workingHours, overtimeHours, totalPay } = await getEmployeeAttendance(employeeId);
  
  // Extract numeric salary value
  let baseSalary: number;
  if (typeof employee.salary === 'string') {
    baseSalary = parseInt(employee.salary.replace(/[^\d.]/g, ''), 10);
  } else {
    baseSalary = employee.salary;
  }
  
  // Calculate final salary using AI function with currency
  const finalSalary = await calculateSalaryWithGPT(employeeId, baseSalary, currency);
  
  // Determine tax, insurance and other deductions
  const taxRate = 0.2;
  const insuranceRate = 0.05;
  const taxDeduction = baseSalary * taxRate;
  const insuranceDeduction = baseSalary * insuranceRate;
  
  const paymentDate = new Date().toISOString().split('T')[0];
  
  // Add record to payroll table
  const { data: payrollData, error: payrollError } = await supabase
    .from('payroll')
    .insert({
      employee_id: employeeId,
      base_pay: baseSalary,
      working_hours: workingHours,
      overtime_hours: overtimeHours,
      salary_paid: finalSalary,
      deductions: taxDeduction + insuranceDeduction,
      overtime_pay: overtimeHours * (baseSalary / 160) * 1.5, // Overtime rate of 1.5x
      payment_status: 'Paid',
      payment_date: paymentDate,
      processing_date: new Date().toISOString()
    })
    .select()
    .single();

  if (payrollError) throw payrollError;
  
  // Generate PDF payslip
  try {
    const paymentDate = new Date().toLocaleDateString('en-GB');
    
    const pdfResult = await generatePayslipPDF(
      employeeId, 
      {
        name: employee.name,
        title: employee.title || 'Employee', // Use title instead of job_title
        salary: baseSalary.toString(),
        department: employee.department,
        paymentDate,
        currency
      },
      true // Upload to storage
    );
    
    // Send notification to the employee
    if (employee.user_id) {
      await sendNotification({
        user_id: employee.user_id,
        title: 'Payslip Generated',
        message: `Your payslip for ${paymentDate} has been processed and is now available for viewing.`,
        type: 'info',
        related_entity: 'payroll',
        related_id: payrollData?.id || employeeId
      });
    }
    
  } catch (pdfError) {
    console.error('Error generating payslip PDF:', pdfError);
    // Continue as PDF generation is non-critical
  }
  
  return { success: true };
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
      
    if (error) console.error('Error saving payroll history:', error);
    return !error;
  } catch (err) {
    console.error('Exception in savePayrollHistory:', err);
    return false;
  }
};
