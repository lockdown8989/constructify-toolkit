
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PayrollHistoryRecord {
  id: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  processed_by: string;
  processing_date: string;
  employee_ids: string[];
  profiles: {
    first_name: string;
    last_name: string;
  }[];
}

// Fetch payroll processing history
export const usePayrollHistory = () => {
  return useQuery({
    queryKey: ['payroll-history'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payroll_history')
          .select(`
            *,
            profiles:processed_by(
              first_name,
              last_name
            )
          `)
          .order('processing_date', { ascending: false });
        
        if (error) throw error;
        
        // Safely cast the data to the correct type
        return (data || []).map(item => ({
          ...item,
          profiles: item.profiles || []
        })) as unknown as PayrollHistoryRecord[];
      } catch (error) {
        console.error('Error fetching payroll history:', error);
        throw error;
      }
    }
  });
};

// Fetch payroll processing details
export const usePayrollHistoryDetails = (historyId: string) => {
  return useQuery({
    queryKey: ['payroll-history-details', historyId],
    queryFn: async () => {
      if (!historyId) return null;
      
      try {
        const { data, error } = await supabase
          .from('payroll_history')
          .select(`
            *,
            profiles:processed_by(
              first_name,
              last_name
            )
          `)
          .eq('id', historyId)
          .single();
        
        if (error) throw error;
        
        return data as unknown as PayrollHistoryRecord;
      } catch (error) {
        console.error('Error fetching payroll history details:', error);
        throw error;
      }
    },
    enabled: !!historyId
  });
};
