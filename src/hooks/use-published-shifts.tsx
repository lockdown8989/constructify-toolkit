
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { isAfter, parseISO } from 'date-fns';

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
  expiration_date?: string;
}

export function usePublishedShifts() {
  const { user, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch published open shifts - filter out expired ones
  const { data: publishedShifts = [], isLoading } = useQuery({
    queryKey: ['published-shifts'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('status', 'open')
        // Filter out shifts that are expired or in the past
        .gte('start_time', now)
        .or(`expiration_date.is.null,expiration_date.gte.${now}`)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Additional client-side filtering for extra safety
      const filteredData = (data || []).filter(shift => {
        const shiftStartTime = new Date(shift.start_time);
        const now = new Date();
        
        // Filter out shifts that have already started
        if (shiftStartTime <= now) {
          return false;
        }
        
        // Filter out shifts that have expired
        if (shift.expiration_date && isAfter(now, parseISO(shift.expiration_date))) {
          return false;
        }
        
        return true;
      });
      
      return filteredData as PublishedShift[];
    },
    enabled: !!user
  });

  // Claim shift mutation (only for employees)
  const claimShift = useMutation({
    mutationFn: async (shiftId: string) => {
      if (!user) {
        throw new Error('You must be logged in to claim shifts');
      }

      if (!isEmployee) {
        throw new Error('Only employees can claim shifts. Please contact your manager if you need employee access.');
      }

      console.log('Attempting to claim shift for user:', user.id);

      // Get employee record
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (empError) {
        console.error('Employee lookup error:', empError);
        if (empError.code === 'PGRST116') {
          throw new Error('Your account is not set up as an employee. Please contact your manager to create your employee profile.');
        }
        throw new Error(`Failed to find employee record: ${empError.message}`);
      }

      if (!employee) {
        throw new Error('Your account is not linked to an employee record. Please contact your manager.');
      }

      console.log('Found employee record:', employee);

      // Check if shift is still available and not expired
      const { data: shift, error: shiftError } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('id', shiftId)
        .eq('status', 'open')
        .single();

      if (shiftError) {
        console.error('Shift lookup error:', shiftError);
        throw new Error(`Failed to find shift: ${shiftError.message}`);
      }

      if (!shift) {
        throw new Error('This shift is no longer available');
      }

      // Check if shift has expired
      const now = new Date();
      const shiftStartTime = new Date(shift.start_time);
      
      if (shiftStartTime <= now) {
        throw new Error('This shift has already started and cannot be claimed');
      }
      
      if (shift.expiration_date && isAfter(now, parseISO(shift.expiration_date))) {
        throw new Error('This shift has expired and is no longer available');
      }

      console.log('Found available shift:', shift);

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

      if (assignError) {
        console.error('Assignment creation error:', assignError);
        throw new Error(`Failed to create assignment: ${assignError.message}`);
      }

      console.log('Created assignment:', assignment);

      // Update open shift status to assigned
      const { error: updateError } = await supabase
        .from('open_shifts')
        .update({ 
          status: 'assigned',
          applications_count: 1
        })
        .eq('id', shiftId);

      if (updateError) {
        console.error('Shift update error:', updateError);
        throw new Error(`Failed to update shift status: ${updateError.message}`);
      }

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
          shift_type: 'claimed_shift',
          created_platform: 'web',
          last_modified_platform: 'web'
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Schedule creation error:', scheduleError);
        throw new Error(`Failed to create schedule entry: ${scheduleError.message}`);
      }

      console.log('Created schedule entry:', scheduleData);

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
      console.error('Shift claim error:', error);
      toast({
        title: "Failed to Claim Shift",
        description: error instanceof Error ? error.message : "Please try again or contact your manager.",
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
