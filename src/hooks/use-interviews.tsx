
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

export type Interview = Database['public']['Tables']['interviews']['Row'];
export type NewInterview = Database['public']['Tables']['interviews']['Insert'];
export type InterviewUpdate = Database['public']['Tables']['interviews']['Update'];

export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select('*');
      
      if (error) throw error;
      return data as Interview[];
    }
  });
}

export function useAddInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newInterview: NewInterview) => {
      const { data, error } = await supabase
        .from('interviews')
        .insert(newInterview)
        .select()
        .single();
      
      if (error) throw error;
      return data as Interview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: InterviewUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('interviews')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Interview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });
}
