import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type Schedule = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  employee_id: string;
  created_at: string;
};

export type NewSchedule = Omit<Schedule, 'id' | 'created_at'>;

export function useSchedules() {
  const { user, isManager } = useAuth();

  return useQuery({
    queryKey: ['schedules', isManager, user?.id],
    queryFn: async () => {
      let query = supabase.from('schedules').select('*');

      // If not a manager, only fetch the user's own schedules
      if (!isManager && user) {
        // First, find the employee record associated with this user
        const { data: employeeData } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (employeeData) {
          // Filter schedules to show only this employee's schedules
          query = query.eq('employee_id', employeeData.id);
        } else {
          // If no employee record found, return empty array
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Schedule[];
    }
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return {
    createSchedule: async (newSchedule: NewSchedule) => {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .insert(newSchedule)
          .select()
          .single();

        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        toast({
          title: "Schedule created",
          description: "New schedule has been successfully created."
        });
        
        return data as Schedule;
      } catch (error: any) {
        toast({
          title: "Failed to create schedule",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    }
  };
}

export function useAddSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newSchedule: NewSchedule) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert(newSchedule)
        .select()
        .single();

      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule added",
        description: "New schedule has been successfully added."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<Schedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule updated",
        description: "Schedule has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule deleted",
        description: "Schedule has been successfully removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
