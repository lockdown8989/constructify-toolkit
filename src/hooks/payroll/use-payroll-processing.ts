
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { PayrollRecord, PayslipData } from '@/types/supabase/payroll';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const processEmployeePayroll = async (employee: Employee): Promise<PayrollRecord> => {
  // Calculate base pay
  const salary = typeof employee.salary === 'number' ? employee.salary : 
                 typeof employee.salary === 'string' ? parseFloat(employee.salary.replace(/[^0-9.]/g, '')) : 0;
  
  const basePay = salary / 12; // Monthly salary
  
  // Calculate taxes (simplified)
  const taxRate = 0.2; // 20% tax rate
  const taxes = basePay * taxRate;
  
  // Calculate net pay
  const netPay = basePay - taxes;
  
  // Create payroll record
  const payrollRecord: PayrollRecord = {
    id: crypto.randomUUID(),
    employee_id: employee.id,
    employee_name: employee.name, // This field is now in the interface
    payment_date: new Date().toISOString(),
    payment_status: 'Pending',
    working_hours: 160, // Standard monthly hours
    overtime_hours: 0,
    base_pay: basePay,
    overtime_pay: 0,
    deductions: taxes,
    bonus: 0,
    salary_paid: netPay,
    department: employee.department,
    status: 'Pending',
    // Added compatible fields
    pay_period: format(new Date(), 'yyyy-MM'),
    gross_pay: basePay,
    taxes: taxes,
    net_pay: netPay
  };
  
  return payrollRecord;
};

export const savePayrollHistory = async (payrollRecord: PayrollRecord) => {
  try {
    const { data, error } = await supabase
      .from('payroll_history')
      .insert(payrollRecord);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving payroll history:', error);
    throw error;
  }
};

export const usePayrollProcessing = () => {
  const { toast } = useToast();
  
  const processPayroll = async (employees: Employee[]) => {
    if (!employees || employees.length === 0) {
      throw new Error('No employees provided');
    }
    
    try {
      const payrollRecords: PayrollRecord[] = [];
      
      for (const employee of employees) {
        try {
          const record = await processEmployeePayroll(employee);
          payrollRecords.push(record);
          
          // Save to database
          await savePayrollHistory(record);
        } catch (empError) {
          console.error(`Error processing payroll for employee ${employee.id}:`, empError);
          // Continue with next employee even if one fails
        }
      }
      
      if (payrollRecords.length === 0) {
        throw new Error('Failed to process payroll for any employees');
      }
      
      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll for ${payrollRecords.length} employees.`
      });
      
      return payrollRecords;
    } catch (error) {
      console.error("Error processing payroll:", error);
      throw error; // Re-throw to be handled by the caller
    }
  };
  
  return { processPayroll };
};
