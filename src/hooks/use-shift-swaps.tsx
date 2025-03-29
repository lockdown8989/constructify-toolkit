
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_schedule_id: string;
  recipient_schedule_id?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type NewShiftSwap = Omit<ShiftSwap, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
};

export const useShiftSwaps = () => {
  return useQuery({
    queryKey: ['shift_swaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*');
      
      if (error) throw error;
      return data as ShiftSwap[];
    }
  });
};

export const useUserShiftSwaps = (userId: string) => {
  return useQuery({
    queryKey: ['shift_swaps', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);
      
      if (error) throw error;
      return data as ShiftSwap[];
    },
    enabled: !!userId
  });
};

export const useCreateShiftSwap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSwap: NewShiftSwap) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .insert(newSwap)
        .select()
        .single();
      
      if (error) throw error;
      return data as ShiftSwap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
      toast({
        title: "Success",
        description: "Shift swap request created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shift swap request",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateShiftSwap = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<ShiftSwap> & { id: string }) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ShiftSwap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
      toast({
        title: "Success",
        description: "Shift swap request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shift swap request",
        variant: "destructive",
      });
    }
  });
};
