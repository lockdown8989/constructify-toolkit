
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
    enabled: !!employeeId
  });
}
