
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Schedule {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'completed';
  location?: string;
}

export function useSchedules() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      try {
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (!employees) {
          console.log('No employee record found for the current user');
          return [];
        }
          
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('employee_id', employees.id)
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Error fetching schedules:', error);
          return [];
        }
        
        // Add default status if not available
        const processedData = data?.map(schedule => ({
          ...schedule,
          status: schedule.status || 'confirmed'
        })) || [];
        
        console.log('Fetched schedules for employee:', employees.id, processedData.length);
        return processedData;
      } catch (error) {
        console.error('Error in useSchedules hook:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (schedule: Partial<Schedule>) => {
      if (!user) throw new Error('User not authenticated');
      
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
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  // Return an object with the mutation to match the usage pattern
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
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    updateSchedule: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
}
