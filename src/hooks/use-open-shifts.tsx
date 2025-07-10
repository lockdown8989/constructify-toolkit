
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { OpenShiftType } from '@/types/supabase/schedules';
import { useShiftCancellation } from './use-shift-cancellation';
import { isAfter, parseISO } from 'date-fns';

export function useOpenShifts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { cancelShift } = useShiftCancellation();

  // Function to expire old shifts
  const expireShifts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('expire-shifts');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.expiredShifts > 0) {
        console.log(`Expired ${data.expiredShifts} shifts`);
        queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      }
    },
    onError: (error) => {
      console.error('Error expiring shifts:', error);
    }
  });

  const { data: openShifts = [], isLoading } = useQuery({
    queryKey: ['open-shifts'],
    queryFn: async () => {
      // First, expire any old shifts
      try {
        await supabase.functions.invoke('expire-shifts');
      } catch (error) {
        console.warn('Failed to expire shifts:', error);
      }
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        // Include all shifts for the next 7 days, including expired ones for display
        .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Next 7 days
        .order('position_order', { ascending: true, nullsFirst: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Process all shifts but mark expired ones
      const processedData = (data || []).map(shift => {
        const shiftStartTime = new Date(shift.start_time);
        const now = new Date();
        
        // Check if shift is expired
        const isExpired = shift.status === 'expired' || 
                         shiftStartTime <= now || 
                         (shift.expiration_date && isAfter(now, parseISO(shift.expiration_date)));
        
        return {
          ...shift,
          isExpired,
          effectiveStatus: isExpired ? 'expired' : shift.status
        };
      });
      
      // Show available shifts and recently expired ones (for reference)
      const filteredData = processedData.filter(shift => 
        shift.status !== 'cancelled' && 
        shift.status !== 'assigned'
      );
      
      // Process data to ensure compatibility with both formats
      return filteredData.map((shift: any) => ({
        ...shift,
        // Add virtual property aliases for compatibility
        startTime: new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        day: shift.day || new Date(shift.start_time).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      })) as OpenShiftType[];
    },
    enabled: !!user
  });

  const assignShift = useMutation({
    mutationFn: async ({ openShiftId, employeeId }: { openShiftId: string, employeeId: string }) => {
      // Get the open shift details first to check expiration
      const { data: openShift, error: shiftError } = await supabase
        .from('open_shifts')
        .select('*')
        .eq('id', openShiftId)
        .single();

      if (shiftError) throw shiftError;
      
      // Check if the shift has expired or already started
      const now = new Date();
      const shiftStartTime = new Date(openShift.start_time);
      
      if (shiftStartTime <= now) {
        throw new Error("This shift has already started and cannot be assigned.");
      }
      
      if (openShift.expiration_date && isAfter(now, parseISO(openShift.expiration_date))) {
        throw new Error("This shift has expired and is no longer available.");
      }

      // First, create the assignment record
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('open_shift_assignments')
        .insert({
          open_shift_id: openShiftId,
          employee_id: employeeId,
          assigned_by: user?.id,
          status: 'confirmed'
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create a schedule entry for the assigned shift
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          employee_id: employeeId,
          title: openShift.title,
          start_time: openShift.start_time,
          end_time: openShift.end_time
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Get employee data for notification
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('user_id, name')
        .eq('id', employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Create notification for the employee
      if (employee.user_id) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: employee.user_id,
            title: 'New Shift Assignment',
            message: `You have been assigned to ${openShift.title} from ${new Date(openShift.start_time).toLocaleString()} to ${new Date(openShift.end_time).toLocaleString()}`,
            type: 'info',
            related_entity: 'schedules',
            related_id: scheduleData.id
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }

      return { assignmentData, scheduleData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Shift assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning shift:', error);
      toast.error('Failed to assign shift: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });

  return {
    openShifts,
    isLoading,
    assignShift,
    cancelShift,
    expireShifts
  };
}
