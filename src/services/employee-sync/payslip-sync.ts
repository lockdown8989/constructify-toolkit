import { supabase } from '@/integrations/supabase/client';
import { PayslipData } from '@/types/supabase/payroll';
import generatePayslipPDF from '@/utils/exports/payslip-generator';

export const getEmployeeById = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();
    
  if (error) throw error;
  
  return data;
};

export const generatePayslip = async (employeeId: string): Promise<string | null> => {
  try {
    // Get employee data
    const employee = await getEmployeeById(employeeId);
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Get latest payroll record
    const { data: payrollRecord } = await supabase
      .from('payroll_history')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!payrollRecord) {
      throw new Error('No payroll record found for employee');
    }
    
    // Create payslip data with all required fields
    const payslipData: PayslipData = {
      id: payrollRecord.id,
      employeeName: employee.name,
      employeeId: employee.id,
      position: employee.job_title,
      department: employee.department,
      period: payrollRecord.pay_period || new Date().toISOString().split('T')[0],
      payPeriod: payrollRecord.pay_period || new Date().toISOString().split('T')[0],
      paymentDate: payrollRecord.payment_date || new Date().toISOString(),
      baseSalary: parseInt(employee.salary?.toString().replace(/\$|,/g, '') || '0', 10),
      overtimePay: payrollRecord.overtime_pay || 0,
      bonus: payrollRecord.bonus || 0,
      deductions: payrollRecord.deductions || 0,
      grossPay: payrollRecord.base_pay || 0,
      netPay: payrollRecord.salary_paid || 0,
      taxes: payrollRecord.deductions || 0,
      currency: '$',
      name: employee.name,
      bankAccount: '****1234', // Masked for privacy
      title: 'Monthly Payslip',
      salary: employee.salary?.toString() || '0',
      totalPay: payrollRecord.base_pay || 0,
      notes: '' // Adding notes property
    };
    
    // Generate PDF
    const pdfBlob = await generatePayslipPDF(payslipData);
    return typeof pdfBlob === 'string' ? pdfBlob : URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Error generating payslip:', error);
    return null;
  }
};

export const initializePayslipTemplate = async () => {
  // Mock implementation for template initialization
  console.log('Initializing payslip template');
  return true;
};

export const processPayslip = async (employeeId: string): Promise<string | null> => {
  return generatePayslip(employeeId);
};
