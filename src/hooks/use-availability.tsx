
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export type NewAvailabilityRequest = Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: 'Pending' | 'Approved' | 'Rejected';
};

export const useAvailabilityRequests = () => {
  return useQuery({
    queryKey: ['availability_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*');
      
      if (error) throw error;
      return data as AvailabilityRequest[];
    }
  });
};

export const useUserAvailabilityRequests = (userId: string) => {
  return useQuery({
    queryKey: ['availability_requests', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select('*')
        .eq('employee_id', userId);
      
      if (error) throw error;
      return data as AvailabilityRequest[];
    },
    enabled: !!userId
  });
};

export const useCreateAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newRequest: NewAvailabilityRequest) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .insert(newRequest)
        .select()
        .single();
      
      if (error) throw error;
      return data as AvailabilityRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      toast({
        title: "Success",
        description: "Availability request created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create availability request",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateAvailabilityRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<AvailabilityRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('availability_requests')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AvailabilityRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
      toast({
        title: "Success",
        description: "Availability request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability request",
        variant: "destructive",
      });
    }
  });
};
