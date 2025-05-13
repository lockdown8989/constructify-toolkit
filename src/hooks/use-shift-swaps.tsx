
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id?: string;
  requester_schedule_id: string;
  recipient_schedule_id?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftSwapInput {
  requester_id: string;
  recipient_id?: string;
  requester_schedule_id: string;
  recipient_schedule_id?: string;
  notes?: string;
  status: string;
}

export interface UpdateShiftSwapInput {
  id: string;
  status: string;
  updated_at: string;
}

export const useShiftSwaps = () => {
  const [swapRequests, setSwapRequests] = useState<ShiftSwap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch swap requests
  useEffect(() => {
    const fetchSwapRequests = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('shift_swaps')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSwapRequests(data as ShiftSwap[]);
      } catch (error) {
        console.error('Error fetching swap requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load shift swap requests',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwapRequests();
  }, []);

  // Handle accept swap
  const handleAcceptSwap = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shift_swaps')
        .update({ status: 'Approved' })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSwapRequests(prev => 
        prev.map(swap => swap.id === id ? { ...swap, status: 'Approved' } : swap)
      );

      toast({
        title: 'Swap Approved',
        description: 'The shift swap request has been approved',
      });
    } catch (error) {
      console.error('Error accepting swap:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve shift swap',
        variant: 'destructive',
      });
    }
  };

  // Handle reject swap
  const handleRejectSwap = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shift_swaps')
        .update({ status: 'Rejected' })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSwapRequests(prev => 
        prev.map(swap => swap.id === id ? { ...swap, status: 'Rejected' } : swap)
      );

      toast({
        title: 'Swap Rejected',
        description: 'The shift swap request has been rejected',
      });
    } catch (error) {
      console.error('Error rejecting swap:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject shift swap',
        variant: 'destructive',
      });
    }
  };

  return {
    swapRequests,
    isLoading,
    handleAcceptSwap,
    handleRejectSwap,
  };
};

// Create swap hook
export const useCreateShiftSwap = () => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const mutate = async (newSwap: CreateShiftSwapInput) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase
        .from('shift_swaps')
        .insert(newSwap)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Swap Request Submitted',
        description: 'Your shift swap request has been submitted',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create shift swap: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };
  
  return { mutate, isPending };
};

// Update swap hook
export const useUpdateShiftSwap = () => {
  const { toast } = useToast();
  
  const mutate = async (updateData: UpdateShiftSwapInput) => {
    try {
      const { error } = await supabase
        .from('shift_swaps')
        .update({ 
          status: updateData.status,
          updated_at: updateData.updated_at
        })
        .eq('id', updateData.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Swap Updated',
        description: `Shift swap status changed to ${updateData.status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update shift swap: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return { mutate };
};

// Delete swap hook
export const useDeleteShiftSwap = () => {
  const { toast } = useToast();
  
  const mutate = async (id: string, options?: { onSuccess?: () => void }) => {
    try {
      const { error } = await supabase
        .from('shift_swaps')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete shift swap: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return { mutate };
};
