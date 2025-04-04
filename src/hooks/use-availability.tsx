import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type AvailabilityRequest = {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
};

export type NewAvailabilityRequest = Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at'> & {
  status?: 'Pending' | 'Approved' | 'Rejected';
};

export type UpdateAvailabilityRequest = Partial<AvailabilityRequest> & { id: string };

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
      const { data, error } = await (supabase as any)
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

// Create a new availability request
export function useCreateAvailabilityRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailabilityRequest) => {
      const { data, error } = await (supabase as any)
        .from('availability_requests')
        .insert({
          ...newRequest,
          status: newRequest.status || 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating availability request:', error);
        throw error;
      }
      return data as AvailabilityRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_requests', data.employee_id] });
    }
  });
}

// Update an availability request
export function useUpdateAvailabilityRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (update: UpdateAvailabilityRequest) => {
      const { id, ...updateData } = update;
      
      if (!id) throw new Error('ID is required for update');
      
      const { data, error } = await (supabase as any)
        .from('availability_requests')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating availability request:', error);
        throw error;
      }
      return data as AvailabilityRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_requests', data.employee_id] });
    }
  });
}

// Delete an availability request
export function useDeleteAvailabilityRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get the employee_id before deletion
      const { data: requestData } = await (supabase as any)
        .from('availability_requests')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      const employeeId = requestData?.employee_id;
      
      const { error } = await (supabase as any)
        .from('availability_requests')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting availability request:', error);
        throw error;
      }
      return { id, employeeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['availability_requests', result.employeeId] });
      }
    }
  });
}
