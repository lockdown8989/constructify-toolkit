
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { sendNotification } from '@/services/NotificationService';

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

export type NewAvailabilityRequest = {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null;
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_requests', data.employee_id] });
      
      // Get employee details for notification
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name')
        .eq('id', data.employee_id)
        .single();
      
      const employeeName = employeeData?.name || 'An employee';
      
      // Notify managers about the new request
      try {
        // Get all manager user ids
        const { data: managerRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'employer', 'hr']);
        
        if (managerRoles && managerRoles.length > 0) {
          // Send notification to each manager
          for (const manager of managerRoles) {
            await sendNotification({
              user_id: manager.user_id,
              title: "New Availability Request",
              message: `${employeeName} has submitted a new availability request for ${data.date}`,
              type: "info",
              related_entity: "availability_requests",
              related_id: data.id
            });
          }
        }
      } catch (notifyError) {
        console.error('Error notifying managers:', notifyError);
        // Continue execution even if notification fails
      }
      
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
    mutationFn: async (update: UpdateAvailabilityRequest) => {
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability_requests', data.employee_id] });
      
      // Get employee details for notification
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, user_id')
        .eq('id', data.employee_id)
        .single();
      
      if (employeeData) {
        // If status was updated, notify the employee
        if (update.status === 'Approved' || update.status === 'Rejected') {
          try {
            await sendNotification({
              user_id: employeeData.user_id,
              title: `Availability Request ${update.status}`,
              message: `Your availability request for ${data.date} has been ${update.status.toLowerCase()}.`,
              type: update.status === 'Approved' ? "success" : "warning",
              related_entity: "availability_requests",
              related_id: data.id
            });
          } catch (notifyError) {
            console.error('Error notifying employee:', notifyError);
            // Continue execution even if notification fails
          }
        }
      }
      
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
      // Get the employee_id before deletion
      const { data: requestData } = await supabase
        .from('availability_requests')
        .select('employee_id')
        .eq('id', id)
        .single();
      
      const employeeId = requestData?.employee_id;
      
      const { error } = await supabase
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
      queryClient.invalidateQueries({ queryKey: ['availability-requests'] });
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['availability_requests', result.employeeId] });
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
