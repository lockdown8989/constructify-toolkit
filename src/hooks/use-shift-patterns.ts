
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPattern } from '@/types/shift-patterns';

export function useShiftPatterns() {
  return useQuery({
    queryKey: ['shift-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching shift patterns:', error);
        throw error;
      }
      
      return data as ShiftPattern[];
    }
  });
}

export function useShiftPattern(id: string | undefined) {
  return useQuery({
    queryKey: ['shift-pattern', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('shift_patterns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching shift pattern:', error);
        throw error;
      }
      
      return data as ShiftPattern;
    },
    enabled: !!id
  });
}
