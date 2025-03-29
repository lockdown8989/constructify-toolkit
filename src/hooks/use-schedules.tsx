
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ScheduleModel } from "@/types/database";

export interface Schedule {
  id: string;
  employee_id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export const useSchedules = (date?: Date) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['schedules', date?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('schedules')
        .select('*');
      
      if (date) {
        const dateString = date.toISOString().split('T')[0];
        // Use an equality check on the date portion rather than ilike
        query = query.filter('start_time', 'gte', `${dateString}T00:00:00`)
                     .filter('start_time', 'lt', `${dateString}T23:59:59`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Failed to fetch schedules",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Schedule[];
    },
  });
};

export const useCreateSchedule = () => {
  const { toast } = useToast();
  
  const createSchedule = async (schedule: Omit<Schedule, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Failed to create schedule",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "Schedule created",
      description: "The schedule has been successfully created.",
    });
    
    return data as Schedule;
  };
  
  return { createSchedule };
};

export const useDeleteSchedule = () => {
  const { toast } = useToast();
  
  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Schedule deleted",
      description: "The schedule has been successfully deleted.",
    });
    
    return true;
  };
  
  return { deleteSchedule };
};
