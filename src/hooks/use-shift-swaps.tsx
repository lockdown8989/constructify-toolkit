
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id?: string | null;
  requester_schedule_id: string;
  recipient_schedule_id?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  requester?: { name: string };
  recipient?: { name: string };
}

export interface ShiftSwapRequest {
  id: string;
  requester_id: string;
  recipient_id?: string | null;
  requester_schedule_id: string;
  recipient_schedule_id?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  requester?: { name: string };
  recipient?: { name: string };
}

export const useShiftSwaps = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: swapRequests, isLoading, error } = useQuery({
    queryKey: ['shift-swaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ShiftSwap[];
    }
  });
  
  const acceptSwapMutation = useMutation({
    mutationFn: async (swapId: string) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update({ 
          status: 'Approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', swapId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: "Success",
        description: "Shift swap approved"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to approve shift swap: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const rejectSwapMutation = useMutation({
    mutationFn: async (swapId: string) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update({ 
          status: 'Rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', swapId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: "Success",
        description: "Shift swap rejected"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to reject shift swap: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleAcceptSwap = (swapId: string) => {
    acceptSwapMutation.mutate(swapId);
  };
  
  const handleRejectSwap = (swapId: string) => {
    rejectSwapMutation.mutate(swapId);
  };
  
  return {
    swapRequests,
    isLoading,
    error,
    handleAcceptSwap,
    handleRejectSwap
  };
};

// Create a hook for creating shift swaps
export const useCreateShiftSwap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSwap: Partial<ShiftSwap>) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .insert([newSwap])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: "Success",
        description: "Shift swap request created"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create shift swap: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

// Create hooks for updating and deleting shift swaps
export const useUpdateShiftSwap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ShiftSwap> }) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: "Success",
        description: "Shift swap updated"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update shift swap: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteShiftSwap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_swaps')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      toast({
        title: "Success", 
        description: "Shift swap deleted"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete shift swap: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};
