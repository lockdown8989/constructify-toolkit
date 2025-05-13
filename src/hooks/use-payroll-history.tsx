
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PayrollHistoryRecord {
  id: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  processed_by: string;
  processing_date: string;
  employee_ids?: string[];
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const usePayrollHistory = (limit: number = 10) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payroll-processing-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_history')
        .select(`
          id, 
          employee_count, 
          success_count, 
          fail_count, 
          processed_by, 
          processing_date,
          employee_ids,
          profiles:processed_by(first_name, last_name)
        `)
        .order('processing_date', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data as PayrollHistoryRecord[];
    }
  });

  return {
    history: data,
    isLoading,
    error,
    refresh: refetch
  };
};
