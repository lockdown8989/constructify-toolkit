
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/dashboard/salary-table/types';
import { calculateSalaryWithGPT, getEmployeeAttendance } from './use-salary-calculation';

export const processEmployeePayroll = async (employeeId: string, employee: Employee) => {
  const { workingHours, overtimeHours } = await getEmployeeAttendance(employeeId);
  const baseSalary = parseInt(employee.salary.replace(/\$|,/g, ''), 10);
  const finalSalary = await calculateSalaryWithGPT(employeeId, baseSalary);

  const { error: payrollError } = await supabase
    .from('payroll')
    .insert({
      employee_id: employeeId,
      base_pay: baseSalary,
      working_hours: workingHours,
      overtime_hours: overtimeHours,
      salary_paid: finalSalary,
      payment_status: 'Paid',
      payment_date: new Date().toISOString().split('T')[0]
    });

  if (payrollError) throw payrollError;
  return { success: true };
};
