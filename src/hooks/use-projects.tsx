
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export type Project = Database['public']['Tables']['projects']['Row'];

export function useProjects() {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('deadline', { ascending: true });
      
      if (error) {
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Project[];
    },
    enabled: !!session // Only run query if user is authenticated
  });
}

export function useProjectsForDepartment(department: string) {
  const { session } = useAuth();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['projects', department],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('department', department)
        .order('deadline', { ascending: true });
      
      if (error) {
        toast({
          title: "Error loading department projects",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Project[];
    },
    enabled: !!session && !!department // Only run query if user is authenticated and department is provided
  });
}
