
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ['salary-statistics', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_statistics')
        .select('*')
        .eq('employee_id', employeeId)
        .order('month', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as SalaryStatistics;
    },
    enabled: !!employeeId
  });
}
