
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilityRequest } from '@/types/availability';
import { useAuth } from '@/hooks/use-auth';

// Get all availability requests for the current user or for all employees if manager
export function useAvailabilityRequests(employeeId?: string) {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['availability_requests', employeeId, isManager, user?.id],
    queryFn: async () => {
      console.log('Fetching availability requests, user:', user?.id, 'isManager:', isManager, 'employeeId:', employeeId);
      
      let query = supabase
        .from('availability_requests')
        .select(`
          *,
          employees:employee_id (
            name,
            department,
            job_title
          )
        `);
      
      // If manager, fetch all requests or specific employee's requests if employeeId is provided
      if (isManager) {
        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }
      } else if (user) {
        // Not a manager, only fetch the user's own availability requests
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (employeeError) {
          console.error('Error fetching employee record:', employeeError);
          return []; // Return empty array if we can't find employee
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
      
      // Order by most recent first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching availability requests:', error);
        throw error;
      }
      
      console.log('Fetched availability requests:', data?.length || 0, data);
      return data as AvailabilityRequest[] || [];
    },
    enabled: !!user
  });
}

// Get a single availability request by ID
export function useAvailabilityRequest(id: string) {
  return useQuery({
    queryKey: ['availability_request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select(`
          *,
          employees:employee_id (
            name,
            department,
            job_title
          )
        `)
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
