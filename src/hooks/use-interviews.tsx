
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { InterviewModel } from '@/types/database';

export type Interview = Database['public']['Tables']['interviews']['Row'];
export type NewInterview = Database['public']['Tables']['interviews']['Insert'];
export type InterviewUpdate = Database['public']['Tables']['interviews']['Update'];

export function useInterviews() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      if (!session) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .select('*');
      
      if (error) {
        toast({
          title: "Error loading interviews",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as InterviewModel[];
    },
    enabled: !!session // Only run query if user is authenticated
  });
}

export function useAddInterview() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newInterview: NewInterview) => {
      if (!session) {
        throw new Error("You must be logged in to add an interview");
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .insert(newInterview)
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Error adding interview",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as InterviewModel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: "Interview added",
        description: `Interview for ${data.candidate_name} has been added.`,
      });
    }
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...update }: InterviewUpdate & { id: string }) => {
      if (!session) {
        throw new Error("You must be logged in to update an interview");
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Error updating interview",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as InterviewModel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: "Interview updated",
        description: `Interview for ${data.candidate_name} has been updated.`,
      });
    }
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!session) {
        throw new Error("You must be logged in to delete an interview");
      }
      
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: "Error deleting interview",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({
        title: "Interview deleted",
        description: "The interview has been deleted successfully.",
      });
    }
  });
}
