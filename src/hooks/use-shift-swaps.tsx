
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

export type ShiftSwap = Database['public']['Tables']['shift_swaps']['Row'];
export type NewShiftSwap = Database['public']['Tables']['shift_swaps']['Insert'];
export type ShiftSwapUpdate = Database['public']['Tables']['shift_swaps']['Update'];

// Get all shift swaps
export function useShiftSwaps() {
  return useQuery({
    queryKey: ['shift_swaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shift swaps:', error);
        throw error;
      }
      return data || [];
    }
  });
}

// Get shift swaps for a specific employee (either requester or recipient)
export function useEmployeeShiftSwaps(employeeId: string) {
  return useQuery({
    queryKey: ['shift_swaps', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .select('*')
        .or(`requester_id.eq.${employeeId},recipient_id.eq.${employeeId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching employee shift swaps:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!employeeId
  });
}

// Create a new shift swap
export function useCreateShiftSwap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSwap: NewShiftSwap) => {
      const { data, error } = await supabase
        .from('shift_swaps')
        .insert(newSwap)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating shift swap:', error);
        throw error;
      }
      return data;
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
      
      const { data, error } = await supabase
        .from('shift_swaps')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating shift swap:', error);
        throw error;
      }
      return data;
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
      const { data: swapData } = await supabase
        .from('shift_swaps')
        .select('requester_id, recipient_id')
        .eq('id', id)
        .single();
      
      const requester = swapData?.requester_id;
      const recipient = swapData?.recipient_id;
      
      const { error } = await supabase
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
