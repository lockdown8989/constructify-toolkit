
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  task: string;
  time: string;
  status: 'Completed' | 'Pending';
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
        query = query.eq('date', dateString);
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
