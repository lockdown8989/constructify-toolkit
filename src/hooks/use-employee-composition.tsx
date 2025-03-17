
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EmployeeCompositionModel } from "@/types/database";

export const useEmployeeComposition = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['employee-composition'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_composition')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        toast({
          title: "Failed to fetch employee composition data",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      if (data && data.length > 0) {
        return data[0] as EmployeeCompositionModel;
      }
      
      // Return default values if no data exists
      return {
        id: '',
        total_employees: 0,
        male_percentage: 0,
        female_percentage: 0,
        updated_at: new Date().toISOString()
      };
    },
  });
};
