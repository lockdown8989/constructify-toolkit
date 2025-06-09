
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface SalaryStatistics {
  id: string;
  employee_id: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  payment_status: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useSalaryStatistics(employeeId?: string) {
  const { toast } = useToast();
  const { user, isPayroll } = useAuth();
  
  return useQuery({
    queryKey: ['salary-statistics', employeeId, user?.id],
    queryFn: async () => {
      // If no employeeId provided and user is not payroll, get their own employee record
      let targetEmployeeId = employeeId;
      
      if (!targetEmployeeId && !isPayroll && user) {
        console.log("Getting employee data for current user:", user.id);
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (empError) {
          console.error('Error fetching employee data:', empError);
          throw empError;
        }
        
        if (!employeeData) {
          throw new Error("Employee record not found for current user");
        }
        
        targetEmployeeId = employeeData.id;
      }
      
      if (!targetEmployeeId) {
        console.log("No employee ID available");
        return null;
      }
      
      console.log("Fetching salary statistics for employee:", targetEmployeeId);
      
      try {
        // Fetch the latest salary statistics directly without calculation
        const { data, error } = await supabase
          .from('salary_statistics')
          .select('*')
          .eq('employee_id', targetEmployeeId)
          .order('month', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching salary statistics:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("No salary statistics found, fetching employee data for default values");
          
          // If no salary stats exist, get employee basic info for defaults
          const { data: employeeData, error: empError } = await supabase
            .from('employees')
            .select('salary')
            .eq('id', targetEmployeeId)
            .single();
            
          if (empError) {
            console.error('Error fetching employee data:', empError);
            throw empError;
          }
          
          if (!employeeData) {
            throw new Error("Employee not found");
          }
          
          // Create default salary statistics based on employee data
          const defaultStats: SalaryStatistics = {
            id: 'default',
            employee_id: targetEmployeeId,
            month: new Date().toISOString(),
            base_salary: employeeData.salary || 0,
            bonus: 0,
            deductions: (employeeData.salary || 0) * 0.25, // Example: 25% deductions
            net_salary: (employeeData.salary || 0) * 0.75, // Example: Net is 75% of gross
            payment_status: 'Pending',
            payment_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return defaultStats;
        }
        
        return data[0] as SalaryStatistics;
      } catch (error) {
        console.error("Error in useSalaryStatistics:", error);
        toast({
          title: "Error loading payslip data",
          description: "Unable to load your payslip information. Please try again later.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
}
