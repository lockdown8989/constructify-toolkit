
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPattern } from '@/types/shift-patterns';
import { useToast } from '@/hooks/use-toast';

export const useShiftPatterns = () => {
  return useQuery({
    queryKey: ['shift-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ShiftPattern[];
    },
  });
};

export const useCreateShiftPattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newPattern: Omit<ShiftPattern, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .insert(newPattern)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shift pattern",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateShiftPattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShiftPattern> & { id: string }) => {
      const { data, error } = await supabase
        .from('shift_patterns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shift pattern",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteShiftPattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_patterns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      toast({
        title: "Success",
        description: "Shift pattern deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shift pattern",
        variant: "destructive",
      });
    },
  });
};
