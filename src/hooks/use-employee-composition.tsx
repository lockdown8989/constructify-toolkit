
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EmployeeCompositionModel } from "@/types/database";
import { useEffect } from "react";

/**
 * Hook to fetch and manage employee composition data
 * @returns Query object with employee composition data
 */
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
  
  // Effect to calculate employee composition data periodically
  useEffect(() => {
    const calculateEmployeeComposition = async () => {
      try {
        // Get all employees
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id');
        
        if (empError) throw empError;
        
        // Get a count of employees by gender (simulated for this demo)
        // In a real app, you would query actual gender data
        const totalEmployees = employees?.length || 0;
        
        // Simulate gender distribution (55% male, 45% female)
        // In a real implementation, you would calculate this from actual employee data
        const malePercentage = 55;
        const femalePercentage = 45;
        
        // Check if we already have a record
        const { data: existingRecord } = await supabase
          .from('employee_composition')
          .select('*')
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
  
  // Query to fetch the latest composition data
  return useQuery({
    queryKey: ['employee-composition'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employee_composition')
          .select('*')
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
    refetchInterval: 60000, // Refetch every minute
  });
};
