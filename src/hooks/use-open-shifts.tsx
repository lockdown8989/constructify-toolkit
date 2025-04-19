
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { OpenShiftType } from '@/types/supabase';

export function useOpenShifts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: openShifts = [], isLoading } = useQuery({
    queryKey: ['open-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_shifts')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as OpenShiftType[];
    },
    enabled: !!user
  });

  const assignShift = useMutation({
    mutationFn: async ({ openShiftId, employeeId }: { openShiftId: string, employeeId: string }) => {
      const { data, error } = await supabase
        .from('open_shift_assignments')
        .insert({
          open_shift_id: openShiftId,
          employee_id: employeeId,
          assigned_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      toast.success('Shift assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning shift:', error);
      toast.error('Failed to assign shift');
    }
  });

  return {
    openShifts,
    isLoading,
    assignShift
  };
}
