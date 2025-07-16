import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftTemplate } from '@/types/schedule';
import { useToast } from '@/hooks/use-toast';

export function useShiftPatterns() {
  return useQuery({
    queryKey: ['shift-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching shift templates:', error);
        throw error;
      }
      
      return data as ShiftTemplate[];
    }
  });
}

export function useShiftPattern(id: string | undefined) {
  return useQuery({
    queryKey: ['shift-template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching shift template:', error);
        throw error;
      }
      
      return data as ShiftTemplate;
    },
    enabled: !!id
  });
}

export function useCreateShiftPattern() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shiftTemplate: Omit<ShiftTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shift_templates')
        .insert([shiftTemplate])
        .select()
        .single();

      if (error) {
        console.error('Error creating shift template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast({
        title: "Success",
        description: "Shift template created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create shift template:', error);
      toast({
        title: "Error",
        description: "Failed to create shift template. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateShiftPattern() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id: string } & Omit<ShiftTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { id, ...updateData } = params;
      const { data, error } = await supabase
        .from('shift_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shift template:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast({
        title: "Success",
        description: "Shift template updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update shift template:', error);
      toast({
        title: "Error",
        description: "Failed to update shift template. Please try again.",
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
        .from('shift_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shift template:', error);
        throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast({
        title: "Success",
        description: "Shift template deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete shift template:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift template. Please try again.",
        variant: "destructive",
      });
    },
  });
}
