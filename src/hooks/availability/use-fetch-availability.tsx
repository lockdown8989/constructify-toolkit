
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFetchAvailability = (employeeId?: string) => {
  const fetchAvailability = async () => {
    // If no employeeId is provided, use the current user's ID
    const userId = employeeId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) throw new Error('No user ID available');

    const { data, error } = await supabase
      .from('availability_requests')
      .select('*')
      .eq(employeeId ? 'employee_id' : 'employee_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  };

  return useQuery({
    queryKey: ['availability', employeeId],
    queryFn: fetchAvailability,
    refetchOnWindowFocus: true,
  });
};
