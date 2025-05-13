
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/salary/table/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const processEmployeePayroll = async (
  employeeId: string, 
  employee: Employee, 
  currencyCode: string
): Promise<void> => {
  try {
    // Ensure salary is a number
    const basePay = typeof employee.salary === 'string' ? parseFloat(employee.salary) : employee.salary;
    
    // Use hourly_rate if available, otherwise default to 15
    const hourlyRate = employee.hourly_rate || 15;
    const overtimeHours = Math.floor(Math.random() * 10); // Simulated overtime hours
    const overtimePay = overtimeHours * hourlyRate;
    const workingHours = 160 + overtimeHours; // Standard monthly hours + overtime
    const totalPay = basePay + overtimePay;
    
    // Create payroll record
    const { error } = await supabase
      .from('payroll')
      .insert({
        employee_id: employeeId,
        base_pay: basePay,
        overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        working_hours: workingHours,
        salary_paid: totalPay,
        payment_status: 'Processed',
        processing_date: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to process payroll: ${error.message}`);
    }

    // Generate payslip document
    await generatePayslipDocument(employee, {
      basePay,
      overtimeHours,
      overtimePay,
      totalPay,
      currencyCode
    });

  } catch (err) {
    console.error('Error in processEmployeePayroll:', err);
    throw err;
  }
};

export const savePayrollHistory = async (
  employeeIds: string[],
  successCount: number,
  failCount: number,
  processedBy: string
): Promise<void> => {
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
      throw new Error(`Failed to save payroll history: ${error.message}`);
    }
  } catch (err) {
    console.error('Error in savePayrollHistory:', err);
    throw err;
  }
};

// Helper function to generate PDF payslip
const generatePayslipDocument = async (
  employee: Employee, 
  payrollData: { 
    basePay: number; 
    overtimeHours: number; 
    overtimePay: number; 
    totalPay: number;
    currencyCode: string;
  }
) => {
  try {
    const doc = new jsPDF();
    const currencySymbol = getCurrencySymbol(payrollData.currencyCode);
    
    // Add header
    doc.setFontSize(20);
    doc.text('PAYSLIP', 105, 15, { align: 'center' });
    
    // Add employee info
    doc.setFontSize(12);
    doc.text(`Employee Name: ${employee.name}`, 20, 30);
    doc.text(`Department: ${employee.department || 'N/A'}`, 20, 40);
    doc.text(`Job Title: ${employee.job_title || employee.title || 'N/A'}`, 20, 50);
    doc.text(`Pay Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 20, 60);
    
    // Add payment details table
    (doc as any).autoTable({
      startY: 70,
      head: [['Description', 'Amount']],
      body: [
        ['Base Salary', `${currencySymbol}${payrollData.basePay.toFixed(2)}`],
        ['Overtime Hours', `${payrollData.overtimeHours} hours`],
        ['Overtime Pay', `${currencySymbol}${payrollData.overtimePay.toFixed(2)}`],
        ['Total Pay', `${currencySymbol}${payrollData.totalPay.toFixed(2)}`]
      ],
      theme: 'grid'
    });
    
    // Add footer
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.text('This is a system-generated payslip', 105, finalY + 10, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, finalY + 20, { align: 'center' });
    
    // Return document
    return doc;
  } catch (err) {
    console.error('Error generating payslip document:', err);
    throw err;
  }
};

// Helper function to get currency symbol
const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$'
  };
  
  return currencySymbols[currencyCode] || currencyCode;
};
