
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { AvailabilityRequest } from '@/types/availability';

export const useAvailabilityRequests = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['availability-requests', userId],
    queryFn: async () => {
      // If no user, return empty array
      if (!userId) return [];
      
      // Get employee ID from user ID
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (!employeeData) return [];
      
      // Fetch availability requests for this employee
      const { data, error } = await supabase
        .from('availability_requests')
        .select(`
          *,
          employees(name, department)
        `)
        .eq('employee_id', employeeData.id)
        .order('date', { ascending: true });
        
      if (error) throw error;
      return data as AvailabilityRequest[];
    },
    enabled: !!userId
  });
};
