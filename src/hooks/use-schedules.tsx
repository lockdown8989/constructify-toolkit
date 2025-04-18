
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

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
        
        return data || [];
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
        .insert([schedule])
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
    createSchedule: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error
  };
}
