
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { PayrollRecord, PayslipData } from '@/types/supabase/payroll';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const processEmployeePayroll = async (employee: Employee): Promise<PayrollRecord> => {
  // Calculate base pay
  const basePay = typeof employee.salary === 'number' ? employee.salary / 12 : 0; // Monthly salary
  
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
    pay_period: format(new Date(), 'yyyy-MM'),
    payment_date: new Date().toISOString(),
    gross_pay: basePay,
    taxes: taxes,
    net_pay: netPay,
    working_hours: 160, // Standard monthly hours
    overtime_hours: 0,
    base_pay: basePay,
    overtime_pay: 0,
    deductions: taxes,
    payment_status: 'Pending',
    bonus: 0,
    document_url: null,
    document_name: null,
    salary_paid: netPay,
    department: employee.department,
    status: 'Pending'
  };
  
  return payrollRecord;
};

export const savePayrollHistory = async (payrollRecord: PayrollRecord) => {
  const { data, error } = await supabase
    .from('payroll_history')
    .insert(payrollRecord);
    
  if (error) throw error;
  
  return data;
};

export const usePayrollProcessing = () => {
  const { toast } = useToast();
  
  const processPayroll = async (employees: Employee[]) => {
    try {
      const payrollRecords: PayrollRecord[] = [];
      
      for (const employee of employees) {
        const record = await processEmployeePayroll(employee);
        payrollRecords.push(record);
        
        // Save to database
        await savePayrollHistory(record);
      }
      
      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll for ${employees.length} employees.`
      });
      
      return payrollRecords;
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast({
        title: "Payroll Processing Failed",
        description: "There was an error processing the payroll.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return { processPayroll };
};
