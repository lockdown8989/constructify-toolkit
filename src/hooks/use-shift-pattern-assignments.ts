
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignEmployeesToPatternParams {
  shiftPatternId: string;
  employeeIds: string[];
}

export const useAssignEmployeesToPattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ shiftPatternId, employeeIds }: AssignEmployeesToPatternParams) => {
      console.log('Assigning employees to pattern:', { shiftPatternId, employeeIds });

      // First, remove existing assignments for this pattern
      const { error: deleteError } = await supabase
        .from('shift_pattern_assignments')
        .delete()
        .eq('shift_pattern_id', shiftPatternId);

      if (deleteError) {
        console.error('Error removing existing assignments:', deleteError);
        throw deleteError;
      }

      // Insert new assignments
      if (employeeIds.length > 0) {
        const assignments = employeeIds.map(employeeId => ({
          shift_pattern_id: shiftPatternId,
          employee_id: employeeId,
          assigned_by: null, // Will be set by RLS/auth context if needed
          is_active: true
        }));

        const { data, error: insertError } = await supabase
          .from('shift_pattern_assignments')
          .insert(assignments)
          .select();

        if (insertError) {
          console.error('Error creating assignments:', insertError);
          throw insertError;
        }

        console.log('Successfully created assignments:', data);
        return data;
      }

      return [];
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['shift_pattern_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
      console.log(`Successfully assigned ${variables.employeeIds.length} employees to pattern ${variables.shiftPatternId}`);
      
      toast({
        title: "Success",
        description: `Successfully assigned ${variables.employeeIds.length} employee(s) to the shift pattern.`,
      });

      // Force a refetch after a short delay to ensure data consistency
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['shift_pattern_assignments'] });
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to assign employees to pattern:', error);
      toast({
        title: "Error",
        description: "Failed to assign employees to the shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveEmployeeFromPattern = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ shiftPatternId, employeeId }: { shiftPatternId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('shift_pattern_assignments')
        .delete()
        .eq('shift_pattern_id', shiftPatternId)
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error removing employee from pattern:', error);
        throw error;
      }

      return { shiftPatternId, employeeId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift_pattern_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      
      toast({
        title: "Success",
        description: "Employee removed from shift pattern.",
      });
    },
    onError: (error) => {
      console.error('Failed to remove employee from pattern:', error);
      toast({
        title: "Error",
        description: "Failed to remove employee from shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
};
