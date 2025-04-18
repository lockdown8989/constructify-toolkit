
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { addDays, subDays, format } from 'date-fns';

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

// Function to generate sample data for the demo
const generateSampleSchedules = (employeeId: string): Schedule[] => {
  const now = new Date();
  const schedules: Schedule[] = [];
  
  // Add some completed shifts (in the past)
  [-14, -10, -7, -3].forEach(daysAgo => {
    const startDate = subDays(now, Math.abs(daysAgo));
    startDate.setHours(9, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(17, 0, 0, 0);
    
    schedules.push({
      id: `past-${daysAgo}`,
      title: 'Regular Shift',
      employee_id: employeeId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'completed',
      location: 'Kings Cross',
    });
  });
  
  // Add confirmed upcoming shifts
  [2, 5, 10].forEach(daysAhead => {
    const startDate = addDays(now, daysAhead);
    startDate.setHours(10, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(18, 0, 0, 0);
    
    schedules.push({
      id: `future-${daysAhead}`,
      title: 'Regular Shift',
      employee_id: employeeId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'confirmed',
      location: 'Shoreditch',
    });
  });
  
  // Add a pending shift
  const pendingDate = addDays(now, 7);
  pendingDate.setHours(12, 0, 0, 0);
  const pendingEndDate = new Date(pendingDate);
  pendingEndDate.setHours(20, 0, 0, 0);
  
  schedules.push({
    id: 'pending-1',
    title: 'Special Event',
    employee_id: employeeId,
    start_time: pendingDate.toISOString(),
    end_time: pendingEndDate.toISOString(),
    status: 'pending',
    location: 'Dalston',
  });
  
  return schedules;
};

export function useSchedules() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      // Check if user exists
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
          
        // For demo purposes, generate sample schedules
        const sampleData = generateSampleSchedules(employees.id);
        
        // In a real app, we would fetch from the database
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .order('start_time', { ascending: true });
          
        if (error) {
          console.error('Error fetching schedules:', error);
          // Return sample data on error for the demo
          return sampleData;
        }
        
        // Merge real data with sample data for the demo
        // In a production app, just return the data from the database
        return [...(data || []), ...sampleData];
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
      
      // In a real app, this would create a schedule in the database
      // For demo purposes, we'll just return a mock success
      return { id: Math.random().toString(), ...schedule };
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
