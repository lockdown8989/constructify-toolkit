
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/dashboard/salary-table/types';
import { calculateSalaryWithGPT, getEmployeeAttendance } from './use-salary-calculation';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';

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
  
  // Add record to payroll table
  const { error: payrollError } = await supabase
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
      payment_date: new Date().toISOString().split('T')[0]
    });

  if (payrollError) throw payrollError;
  
  // Generate PDF payslip
  try {
    const paymentDate = new Date().toLocaleDateString('en-GB');
    
    await generatePayslipPDF(
      employeeId, 
      {
        name: employee.name,
        title: employee.job_title || 'Employee',
        salary: baseSalary.toString(),
        department: employee.department,
        paymentDate,
        currency
      },
      true // Upload to storage
    );
  } catch (pdfError) {
    console.error('Error generating payslip PDF:', pdfError);
    // Continue as PDF generation is non-critical
  }
  
  return { success: true };
};
