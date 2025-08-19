
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EmployeeCompositionModel } from "@/types/database";
import { useEffect } from "react";

export const useEmployeeComposition = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for employee composition changes
  useEffect(() => {
    const channel = supabase
      .channel('employee-composition-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_composition'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['employee-composition'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  // Add an effect to calculate and update composition data periodically
  useEffect(() => {
    const calculateEmployeeComposition = async () => {
      try {
        // Get all employees
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id, name');
        
        if (empError) throw empError;
        
        // Calculate gender percentages (this would typically come from employee profiles)
        // In a real implementation, you would query actual gender data
        // This is just a placeholder implementation
        const totalEmployees = employees?.length || 0;
        
        // For demo purposes, we're randomly assigning genders
        // In a real app, you would get this from employee profiles
        const maleCount = Math.floor(totalEmployees * 0.55); // 55% male for demo
        const femaleCount = totalEmployees - maleCount;
        
        const malePercentage = totalEmployees > 0 ? (maleCount / totalEmployees) * 100 : 0;
        const femalePercentage = totalEmployees > 0 ? (femaleCount / totalEmployees) * 100 : 0;
        
        // Check if we already have a record
        const { data: existingRecord } = await supabase
          .from('employee_composition')
          .select('id, total_employees, male_percentage, female_percentage, updated_at')
          .order('updated_at', { ascending: false })
          .limit(1);
        
        // Update the employee composition if it has changed or doesn't exist
        if (existingRecord && existingRecord.length > 0) {
          const current = existingRecord[0];
          if (current.total_employees !== totalEmployees || 
              current.male_percentage !== malePercentage ||
              current.female_percentage !== femalePercentage) {
            
            await supabase
              .from('employee_composition')
              .update({
                total_employees: totalEmployees,
                male_percentage: malePercentage,
                female_percentage: femalePercentage,
                updated_at: new Date().toISOString()
              })
              .eq('id', current.id);
          }
        } else {
          // Create a new record if none exists
          await supabase
            .from('employee_composition')
            .insert({
              total_employees: totalEmployees,
              male_percentage: malePercentage,
              female_percentage: femalePercentage,
            });
        }
      } catch (error) {
        console.error('Error updating employee composition:', error);
      }
    };
    
    // Calculate immediately and then every 5 minutes
    calculateEmployeeComposition();
    const interval = setInterval(calculateEmployeeComposition, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return useQuery({
    queryKey: ['employee-composition'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employee_composition')
          .select('id, total_employees, male_percentage, female_percentage, updated_at')
          .order('updated_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching employee composition:', error);
          toast({
            title: "Failed to fetch employee composition data",
            description: error.message,
            variant: "destructive",
          });
          throw error;
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
      } catch (error) {
        console.error('Unexpected error fetching employee composition:', error);
        return {
          id: '',
          total_employees: 0,
          male_percentage: 0,
          female_percentage: 0,
          updated_at: new Date().toISOString()
        };
      }
    },
    // Static-ish data: cache aggressively
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 24,    // 24 hours
    refetchOnWindowFocus: false,
  });
};
