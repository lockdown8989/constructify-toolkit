
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Schedule } from '@/types/schedule.types';

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (schedule: Partial<Schedule>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating schedule with data:', schedule);
      
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...schedule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: schedule.status || 'confirmed'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }
      
      console.log('Schedule created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating schedules query after successful creation');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    createSchedule: mutation,
    isCreating: mutation.isPending,
    error: mutation.error
  };
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (schedule: Schedule) => {
      console.log('Updating schedule:', schedule);
      
      const { data, error } = await supabase
        .from('schedules')
        .update({
          title: schedule.title,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          notes: schedule.notes,
          status: schedule.status,
          location: schedule.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
      
      console.log('Schedule updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating schedules query after successful update');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    updateSchedule: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
}
