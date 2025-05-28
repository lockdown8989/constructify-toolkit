
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface PublishedShift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  department?: string;
  role?: string;
  notes?: string;
  status: 'open' | 'claimed' | 'cancelled';
  created_by: string;
  claimed_by?: string;
  claimed_at?: string;
  created_at: string;
}

export function usePublishedShifts() {
  const { user, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch published open shifts
  const { data: publishedShifts = [], isLoading } = useQuery({
    queryKey: ['published-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('status', 'open')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as PublishedShift[];
    },
    enabled: !!user
  });

  // Claim shift mutation (only for employees)
  const claimShift = useMutation({
    mutationFn: async (shiftId: string) => {
      if (!user || !isEmployee) {
        throw new Error('Only employees can claim shifts');
      }

      // Get employee record
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empError || !employee) {
        throw new Error('Employee record not found');
      }

      // Check if shift is still available
      const { data: shift, error: shiftError } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('id', shiftId)
        .eq('status', 'open')
        .single();

      if (shiftError || !shift) {
        throw new Error('Shift is no longer available');
      }

      // Create assignment record
      const { data: assignment, error: assignError } = await supabase
        .from('open_shift_assignments')
        .insert({
          open_shift_id: shiftId,
          employee_id: employee.id,
          assigned_by: user.id,
          status: 'confirmed'
        })
        .select()
        .single();

      if (assignError) throw assignError;

      // Update open shift status to claimed
      const { error: updateError } = await supabase
        .from('open_shifts')
        .update({ 
          status: 'assigned',
          applications_count: 1
        })
        .eq('id', shiftId);

      if (updateError) throw updateError;

      // Create schedule entry for the employee
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          employee_id: employee.id,
          title: shift.title,
          start_time: shift.start_time,
          end_time: shift.end_time,
          location: shift.location,
          notes: shift.notes,
          status: 'confirmed',
          published: true,
          shift_type: 'claimed_shift'
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      return { assignment, schedule: scheduleData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      
      toast({
        title: "Shift Claimed Successfully",
        description: "The shift has been added to your schedule.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Claim Shift",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    publishedShifts,
    isLoading,
    claimShift: claimShift.mutate,
    isClaimingShift: claimShift.isPending
  };
}
