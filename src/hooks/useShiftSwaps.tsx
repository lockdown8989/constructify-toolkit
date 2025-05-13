
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShiftSwap } from '@/types/supabase/schedules';

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
