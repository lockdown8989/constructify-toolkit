
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPattern } from '@/types/shift-patterns';
import { useToast } from '@/hooks/use-toast';

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

export function useCreateShiftPattern() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shiftPattern: Omit<ShiftPattern, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .insert([shiftPattern])
        .select()
        .single();

      if (error) {
        console.error('Error creating shift pattern:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create shift pattern:', error);
      toast({
        title: "Error",
        description: "Failed to create shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateShiftPattern() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shiftPattern: ShiftPattern) => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .update({
          name: shiftPattern.name,
          start_time: shiftPattern.start_time,
          end_time: shiftPattern.end_time,
          break_duration: shiftPattern.break_duration,
          grace_period_minutes: shiftPattern.grace_period_minutes,
          overtime_threshold_minutes: shiftPattern.overtime_threshold_minutes,
        })
        .eq('id', shiftPattern.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shift pattern:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update shift pattern:', error);
      toast({
        title: "Error",
        description: "Failed to update shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteShiftPattern() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_patterns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shift pattern:', error);
        throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete shift pattern:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
}
