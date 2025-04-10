
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AvailabilityRequest } from '@/types/availability';

// Get all availability requests
export function useAvailabilityRequests() {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['availability-requests', isManager, user?.id],
    queryFn: async () => {
      let query = supabase.from('availability_requests').select('*');
      
      // If not a manager, only fetch the user's own requests
      if (!isManager && user) {
        // First get the employee ID for the current user
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employeeData) {
          // Filter to show only this employee's requests
          query = query.eq('employee_id', employeeData.id);
        } else {
          // If no employee record found, return empty array
          return [];
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as AvailabilityRequest[];
    }
  });
}

// Get availability requests for a specific employee
export function useEmployeeAvailabilityRequests(employeeId: string) {
  return useQuery({
    queryKey: ['availability_requests', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching employee availability requests:', error);
        throw error;
      }
      return data as AvailabilityRequest[];
    },
    enabled: !!employeeId
  });
}
