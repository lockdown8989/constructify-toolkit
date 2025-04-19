
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Schedule } from '@/types/schedule.types';

export function useScheduleQueries() {
  const { user } = useAuth();
  
  const query = useQuery({
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
        
        const processedData = data?.map(schedule => ({
          ...schedule,
          status: schedule.status || 'confirmed'
        })) || [];
        
        console.log('Fetched schedules for employee:', employees.id, processedData.length);
        return processedData as Schedule[];
      } catch (error) {
        console.error('Error in useSchedules hook:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  return query;
}
