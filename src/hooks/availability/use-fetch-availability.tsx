
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export const useGetAvailability = (filters?: Partial<{
  status: string;
  employee_id: string;
  date: string;
}>) => {
  const { user, isManager } = useAuth();

  return useQuery({
    queryKey: ['availability', filters, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('availability_requests')
        .select('*');

      // Add filters
      if (filters) {
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
        if (filters.date) query = query.eq('date', filters.date);
      }

      // If not a manager, only get own records
      if (!isManager && user) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (employeeData) {
          query = query.eq('employee_id', employeeData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Alias for backward compatibility
export const useFetchAvailability = useGetAvailability;
