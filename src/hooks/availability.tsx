
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  manager_notes?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
}

export function useGetAvailability(filters?: Partial<{
  status: string;
  employee_id: string;
  date: string;
}>) {
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
      return data as AvailabilityRequest[];
    },
  });
}

export function useGetAvailabilityById(id?: string) {
  return useQuery({
    queryKey: ['availability', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as AvailabilityRequest;
    },
    enabled: !!id
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (newRequest: Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .insert({
          ...newRequest,
          status: 'Pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as AvailabilityRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({
        title: "Request submitted",
        description: "Your availability request has been submitted for approval."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: { id: string } & Partial<AvailabilityRequest>) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .update(update)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as AvailabilityRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({
        title: "Request updated",
        description: `Availability request has been ${data.status.toLowerCase()}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update request",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('availability_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({
        title: "Request deleted",
        description: "Availability request has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete request",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
