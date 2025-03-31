
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftSwap } from '@/types/supabase';

export { ShiftSwap };

export type NewShiftSwap = Omit<ShiftSwap, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: string;
};
export type ShiftSwapUpdate = Partial<ShiftSwap> & { id: string };

// Get all shift swaps
export function useShiftSwaps() {
  return useQuery({
    queryKey: ['shift_swaps'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('shift_swaps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shift swaps:', error);
        throw error;
      }
      return data as ShiftSwap[];
    }
  });
}

// Get shift swaps for a specific employee (either requester or recipient)
export function useEmployeeShiftSwaps(employeeId: string) {
  return useQuery({
    queryKey: ['shift_swaps', employeeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('shift_swaps')
        .select('*')
        .or(`requester_id.eq.${employeeId},recipient_id.eq.${employeeId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching employee shift swaps:', error);
        throw error;
      }
      return data as ShiftSwap[];
    },
    enabled: !!employeeId
  });
}

// Create a new shift swap
export function useCreateShiftSwap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSwap: NewShiftSwap) => {
      const { data, error } = await (supabase as any)
        .from('shift_swaps')
        .insert({
          ...newSwap,
          status: newSwap.status || 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating shift swap:', error);
        throw error;
      }
      return data as ShiftSwap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.requester_id] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.recipient_id] });
    }
  });
}

// Update a shift swap
export function useUpdateShiftSwap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (update: ShiftSwapUpdate) => {
      const { id, ...updateData } = update;
      
      if (!id) throw new Error('ID is required for update');
      
      const { data, error } = await (supabase as any)
        .from('shift_swaps')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating shift swap:', error);
        throw error;
      }
      return data as ShiftSwap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.requester_id] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.recipient_id] });
    }
  });
}

// Delete a shift swap
export function useDeleteShiftSwap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get the requester and recipient IDs before deletion
      const { data: swapData } = await (supabase as any)
        .from('shift_swaps')
        .select('requester_id, recipient_id')
        .eq('id', id)
        .single();
      
      const requester = swapData?.requester_id;
      const recipient = swapData?.recipient_id;
      
      const { error } = await (supabase as any)
        .from('shift_swaps')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting shift swap:', error);
        throw error;
      }
      return { id, requester, recipient };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
      if (result.requester) {
        queryClient.invalidateQueries({ queryKey: ['shift_swaps', result.requester] });
      }
      if (result.recipient) {
        queryClient.invalidateQueries({ queryKey: ['shift_swaps', result.recipient] });
      }
    }
  });
}
