
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './auth';

// Fix the payroll history hook by properly handling first_name and last_name
export const usePayrollHistory = () => {
  const { user } = useAuth();
  
  const { data: history, isLoading } = useQuery({
    queryKey: ['payroll-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_history')
        .select('*')
        .order('processing_date', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });
  
  // Get the most recent processor's name
  const { data: processorName, isLoading: isLoadingProcessor } = useQuery({
    queryKey: ['payroll-processor-name'],
    queryFn: async () => {
      if (!history || history.length === 0) return '';
      
      const mostRecent = history[0];
      if (!mostRecent.processed_by) return 'System';
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', mostRecent.processed_by)
          .single();
        
        if (error || !data) return 'Unknown';
        
        return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown';
      } catch (error) {
        console.error("Error fetching processor name:", error);
        return 'Unknown';
      }
    },
    enabled: !!history && history.length > 0
  });
  
  // Calculate totals from history
  const totals = {
    processed: history?.reduce((sum, item) => sum + item.employee_count, 0) || 0,
    success: history?.reduce((sum, item) => sum + item.success_count, 0) || 0,
    failed: history?.reduce((sum, item) => sum + item.fail_count, 0) || 0
  };
  
  return {
    history,
    isLoading: isLoading || isLoadingProcessor,
    processorName,
    totals
  };
};
