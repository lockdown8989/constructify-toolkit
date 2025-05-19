
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type ShiftSwap = {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_schedule_id: string;
  recipient_schedule_id: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NewShiftSwap = {
  requester_id: string;
  recipient_id: string;
  requester_schedule_id: string;
  recipient_schedule_id?: string | null;
  notes?: string | null;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
};

export type ShiftSwapUpdate = Partial<ShiftSwap> & { id: string };

// Get all shift swaps
export function useShiftSwaps() {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['shift-swaps', isManager, user?.id],
    queryFn: async () => {
      let query = supabase.from('shift_swaps').select('*');
      
      // If not a manager, only fetch the user's own shift swaps
      if (!isManager && user) {
        // First get the employee ID for the current user
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (employeeData) {
          // Filter to show only shift swaps where this employee is either the requester or recipient
          query = query.or(`requester_id.eq.${employeeData.id},recipient_id.eq.${employeeData.id}`);
        } else {
          // If no employee record found, return empty array
          return [];
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as ShiftSwap[];
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
      return data as ShiftSwap[];
    },
    enabled: !!employeeId
  });
}

// Create a new shift swap
export function useCreateShiftSwap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSwap: NewShiftSwap) => {
      const { data, error } = await supabase
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
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.requester_id] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.recipient_id] });
      toast({
        title: "Success",
        description: "Shift swap request submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit shift swap request: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

// Update a shift swap
export function useUpdateShiftSwap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (update: ShiftSwapUpdate) => {
      const { id, ...updateData } = update;
      
      if (!id) throw new Error('ID is required for update');
      
      const { data, error } = await supabase
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
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.requester_id] });
      queryClient.invalidateQueries({ queryKey: ['shift_swaps', data.recipient_id] });
      toast({
        title: "Success",
        description: "Shift swap updated successfully",
      });
      
      // If the swap was approved, update the schedules
      if (data.status === 'Approved') {
        handleApprovedShiftSwap(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update shift swap: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}

// Helper function to handle approved shift swaps
async function handleApprovedShiftSwap(swapData: ShiftSwap) {
  try {
    // Get the schedules involved in the swap
    const { data: requesterSchedule, error: requesterError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', swapData.requester_schedule_id)
      .single();
      
    if (requesterError) throw requesterError;
    
    // If there's a specific recipient schedule, swap them
    if (swapData.recipient_schedule_id) {
      const { data: recipientSchedule, error: recipientError } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', swapData.recipient_schedule_id)
        .single();
        
      if (recipientError) throw recipientError;
      
      // Swap the employee IDs for both schedules
      await supabase
        .from('schedules')
        .update({ 
          employee_id: swapData.recipient_id,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
          notes: (requesterSchedule.notes || '') + ' (Swapped via shift swap request)'
        })
        .eq('id', swapData.requester_schedule_id);
        
      await supabase
        .from('schedules')
        .update({ 
          employee_id: swapData.requester_id,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
          notes: (recipientSchedule.notes || '') + ' (Swapped via shift swap request)'
        })
        .eq('id', swapData.recipient_schedule_id);
    } else {
      // If no specific recipient schedule, just reassign the requester schedule
      await supabase
        .from('schedules')
        .update({ 
          employee_id: swapData.recipient_id,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
          notes: (requesterSchedule.notes || '') + ' (Assigned via shift swap request)'
        })
        .eq('id', swapData.requester_schedule_id);
    }
    
    // Mark the swap as completed
    await supabase
      .from('shift_swaps')
      .update({ 
        status: 'Completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', swapData.id);
      
    // Create notifications for both employees
    // Get requester and recipient employee details to get user_ids
    const { data: employees } = await supabase
      .from('employees')
      .select('id, user_id, name')
      .in('id', [swapData.requester_id, swapData.recipient_id]);
      
    if (employees && employees.length === 2) {
      const requester = employees.find(e => e.id === swapData.requester_id);
      const recipient = employees.find(e => e.id === swapData.recipient_id);
      
      if (requester?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: requester.user_id,
            title: 'Shift Swap Approved',
            message: `Your shift swap request with ${recipient?.name || 'a colleague'} has been approved`,
            type: 'success',
            related_entity: 'shift_swaps',
            related_id: swapData.id
          });
      }
      
      if (recipient?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: recipient.user_id,
            title: 'New Shift Assignment',
            message: `A shift has been assigned to you via a swap with ${requester?.name || 'a colleague'}`,
            type: 'info',
            related_entity: 'shift_swaps',
            related_id: swapData.id
          });
      }
    }
    
  } catch (error) {
    console.error('Error handling approved shift swap:', error);
    throw error;
  }
}

// Delete a shift swap
export function useDeleteShiftSwap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      if (result.requester) {
        queryClient.invalidateQueries({ queryKey: ['shift_swaps', result.requester] });
      }
      if (result.recipient) {
        queryClient.invalidateQueries({ queryKey: ['shift_swaps', result.recipient] });
      }
      toast({
        title: "Success",
        description: "Shift swap deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete shift swap: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
