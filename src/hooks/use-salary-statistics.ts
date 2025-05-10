
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useSalaryStatistics(employeeId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['salary-statistics', employeeId || user?.id],
    queryFn: async () => {
      // First, try to get the employee ID if only user ID is provided
      let targetEmployeeId = employeeId;
      
      if (!targetEmployeeId && user) {
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employeeError) {
          console.error('Error fetching employee ID:', employeeError);
          throw new Error('Could not find employee record for current user');
        }
        
        targetEmployeeId = employeeData.id;
      }
      
      if (!targetEmployeeId) {
        throw new Error('No employee ID provided');
      }
      
      // Get the current month's start date
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      
      // First check salary_statistics table for the employee's salary data
      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_statistics')
        .select('*')
        .eq('employee_id', targetEmployeeId)
        .eq('month', currentMonth)
        .single();
        
      if (!salaryError && salaryData) {
        return salaryData;
      }
      
      // If no salary statistics record, check payroll table
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', targetEmployeeId)
        .order('payment_date', { ascending: false })
        .limit(1)
        .single();
        
      if (!payrollError && payrollData) {
        return {
          ...payrollData,
          base_salary: payrollData.base_pay,
          net_salary: payrollData.salary_paid,
          month: currentMonth
        };
      }
      
      // If no records found in either table, get base info from employee record
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('salary')
        .eq('id', targetEmployeeId)
        .single();
        
      if (employeeError) {
        throw new Error('Could not find any salary data for employee');
      }
      
      // Return a placeholder record with base employee data
      return {
        id: 'placeholder',
        employee_id: targetEmployeeId,
        month: currentMonth,
        base_salary: employee.salary,
        net_salary: null,
        payment_status: 'Pending',
        deductions: 0,
        bonus: 0,
        payment_date: null
      };
    },
    enabled: !!employeeId || !!user?.id
  });
}
