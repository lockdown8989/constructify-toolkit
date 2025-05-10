
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import { sendNotification } from '@/services/notifications/notification-sender';

export const initializePayslipTemplate = async (employee: Employee) => {
  try {
    // Check if employee already exists in payroll system
    const { data: existingPayroll } = await supabase
      .from('payroll')
      .select('id')
      .eq('employee_id', employee.id)
      .limit(1);
      
    if (existingPayroll && existingPayroll.length > 0) {
      return { success: true, message: 'Employee already has payslip template' };
    }
    
    // Create initial payroll record
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    
    const { data, error } = await supabase
      .from('payroll')
      .insert({
        employee_id: employee.id,
        base_pay: employee.salary,
        salary_paid: 0, // Will be calculated during payroll processing
        deductions: 0,
        payment_status: 'Pending',
        payment_date: currentMonth,
        processing_date: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing payslip template:', error);
    throw error;
  }
};

// Process payslip for an employee
export const processPayslip = async (employeeId: string, month: string) => {
  try {
    // First, ensure salary is calculated
    const salaryResult = await import('./salary-sync').then(module => 
      module.calculateSalary(employeeId, month)
    );
    
    if (!salaryResult.success) {
      throw new Error('Failed to calculate salary for payslip');
    }
    
    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('name, job_title, department, user_id')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    // Update payroll record with calculated values
    const { data: payrollUpdate, error: payrollError } = await supabase
      .from('payroll')
      .update({
        base_pay: salaryResult.baseSalary,
        salary_paid: salaryResult.netSalary,
        deductions: salaryResult.deductions,
        overtime_pay: salaryResult.overtimePay,
        working_hours: salaryResult.totalWorkingHours,
        overtime_hours: salaryResult.totalOvertimeHours,
        payment_status: 'Paid',
        payment_date: new Date().toISOString().split('T')[0]
      })
      .eq('employee_id', employeeId)
      .eq('payment_date', month.substring(0, 10))
      .select()
      .single();
      
    if (payrollError) {
      // If no record exists for this month, create one
      if (payrollError.code === 'PGRST116') {
        const { data: newPayroll, error: insertError } = await supabase
          .from('payroll')
          .insert({
            employee_id: employeeId,
            base_pay: salaryResult.baseSalary,
            salary_paid: salaryResult.netSalary,
            deductions: salaryResult.deductions,
            overtime_pay: salaryResult.overtimePay,
            working_hours: salaryResult.totalWorkingHours,
            overtime_hours: salaryResult.totalOvertimeHours,
            payment_status: 'Paid',
            payment_date: month.substring(0, 10)
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
      } else {
        throw payrollError;
      }
    }
    
    // Get the payment month name for the PDF
    const paymentDate = new Date(month);
    const paymentMonthYear = paymentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Generate PDF payslip
    const pdfResult = await generatePayslipPDF(
      employeeId,
      {
        name: employee?.name || 'Employee',
        title: employee?.job_title || 'Employee',
        department: employee?.department || 'General',
        salary: salaryResult.baseSalary.toString(),
        paymentDate: new Date().toISOString().split('T')[0],
        payPeriod: paymentMonthYear,
        overtimeHours: salaryResult.totalOvertimeHours,
        contractualHours: salaryResult.totalWorkingHours,
      }
    );
    
    // Update payroll record with the document URL and name
    if (pdfResult && pdfResult.url) {
      await supabase
        .from('payroll')
        .update({
          document_url: pdfResult.url,
          document_name: pdfResult.name || `Payslip_${employeeId}_${month.replace('-', '')}.pdf`
        })
        .eq('employee_id', employeeId)
        .eq('payment_date', month.substring(0, 10));
    }
    
    // Notify the employee about the new payslip
    if (employee?.user_id) {
      await sendNotification({
        user_id: employee.user_id,
        title: 'Payslip Available',
        message: `Your payslip for ${paymentMonthYear} is now available. Net pay: ${salaryResult.netSalary.toFixed(2)}`,
        type: 'success',
        related_entity: 'payroll',
        related_id: payrollUpdate?.id
      });
    }
    
    return {
      success: true,
      payslip: pdfResult,
      payrollDetails: payrollUpdate || {}
    };
  } catch (error) {
    console.error('Error processing payslip:', error);
    throw error;
  }
};
