
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilityRequest } from '@/types/supabase';

export { AvailabilityRequest };

export type NewAvailabilityRequest = Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: string;
};
export type AvailabilityRequestUpdate = Partial<AvailabilityRequest> & { id: string };

// Get all availability requests
export function useAvailabilityRequests() {
  return useQuery({
    queryKey: ['availability_requests'],
    queryFn: async () => {
      // Cast supabase to any to bypass TypeScript's type checking since we've extended the types
      const { data, error } = await (supabase as any)
        .from('availability_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching availability requests:', error);
        throw error;
      }
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
    mutationFn: async (update: AvailabilityRequestUpdate) => {
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
