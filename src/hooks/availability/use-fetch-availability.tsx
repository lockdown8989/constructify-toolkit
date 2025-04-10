
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilityRequest } from '@/types/availability';
import { useAuth } from '@/hooks/use-auth';

// Get all availability requests for the current user
export function useAvailabilityRequests(employeeId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['availability_requests', employeeId],
    queryFn: async () => {
      console.log('Fetching availability requests for employee:', employeeId || 'current user');
      
      let query = supabase
        .from('availability_requests')
        .select('*')
        .order('date', { ascending: false });
      
      // If employeeId is provided, filter by that, otherwise try to get current user's employee record
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      } else if (user) {
        // First get the employee ID for the current user
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (employeeError) {
          console.error('Error fetching employee record:', employeeError);
          // Instead of throwing, return empty array with a warning
          console.warn('No employee record found for current user, returning empty availability list');
          return [];
        }
        
        if (employeeData) {
          console.log('Found employee ID for current user:', employeeData.id);
          query = query.eq('employee_id', employeeData.id);
        } else {
          console.warn('No employee record found for current user, returning empty availability list');
          return [];
        }
      } else {
        console.warn('No user logged in and no employeeId provided, returning empty list');
        return [];
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching availability requests:', error);
        throw error;
      }
      
      console.log('Fetched availability requests:', data?.length || 0);
      return data as AvailabilityRequest[] || [];
    },
    enabled: true // Always enabled, but will return empty array when needed
  });
}

// Get a single availability request by ID
export function useAvailabilityRequest(id: string) {
  return useQuery({
    queryKey: ['availability_request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching availability request:', error);
        throw error;
      }
      
      return data as AvailabilityRequest;
    },
    enabled: !!id
  });
}
