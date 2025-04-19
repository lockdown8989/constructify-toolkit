
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';

export type Project = Database['public']['Tables']['projects']['Row'];

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    }
  });
}

export function useProjectsForDepartment(department: string) {
  return useQuery({
    queryKey: ['projects', department],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('department', department)
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!department
  });
}
