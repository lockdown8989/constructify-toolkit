
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth';

// Define the basic availability types
export interface Availability {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: string;
}

export function useAvailability(employeeId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['availability', employeeId || user?.id],
    queryFn: async () => {
      // Use provided employeeId or get from current user
      const id = employeeId || user?.id;
      
      if (!id) {
        console.log("No ID available for availability fetch");
        return [];
      }
      
      // First get the employee ID if we only have user ID
      if (!employeeId && user) {
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (empError || !employeeData) {
          console.error("Error fetching employee id for availability:", empError);
          return [];
        }
        
        employeeId = employeeData.id;
      }
      
      if (!employeeId) {
        console.log("No employee ID available for availability fetch");
        return [];
      }
      
      // Now fetch availability data
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (error) {
        console.error("Error fetching availability data:", error);
        return [];
      }
      
      return data as Availability[];
    },
    enabled: !!employeeId || !!user?.id,
    retry: 1,
    retryDelay: 1000
  });
}
