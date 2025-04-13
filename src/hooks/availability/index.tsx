
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Types for availability requests
export interface AvailabilityRequest {
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
}

export interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface AvailabilityRequestUpdate {
  id: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  notes?: string | null;
  updated_at?: string;
}

// Get all availability requests
export function useAvailabilityRequests() {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['availability_requests', isManager, user?.id],
    queryFn: async () => {
      let query = supabase.from('availability_requests').select('*');
      
      // If not a manager, only fetch the user's own availability requests
      if (!isManager && user) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (employeeData) {
          query = query.eq('employee_id', employeeData.id);
        } else {
          return [];
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching availability requests:', error);
        throw error;
      }
      
      return data as AvailabilityRequest[];
    },
    enabled: !!user
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

// Create a new availability request
export function useCreateAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailabilityRequest) => {
      const { data, error } = await supabase
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
      toast({
        title: "Success",
        description: "Availability request submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

// Update an availability request
export function useUpdateAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (update: AvailabilityRequestUpdate) => {
      const { id, ...updateData } = update;
      
      if (!id) throw new Error('ID is required for update');
      
      const { data, error } = await supabase
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
      toast({
        title: "Success",
        description: "Availability request updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

// Delete an availability request
export function useDeleteAvailabilityRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get the employee_id before deletion for cache invalidation
      const { data: requestData } = await supabase
        .from('availability_requests')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      const employee_id = requestData?.employee_id;
      
      const { error } = await supabase
        .from('availability_requests')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting availability request:', error);
        throw error;
      }
      
      return { id, employee_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      if (result.employee_id) {
        queryClient.invalidateQueries({ queryKey: ['availability_requests', result.employee_id] });
      }
      toast({
        title: "Success",
        description: "Availability request deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete availability request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
