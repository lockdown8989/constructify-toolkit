
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
      console.log('Starting employee assignment process:', { shiftPatternId, employeeIds });

      // Validate inputs
      if (!shiftPatternId || !Array.isArray(employeeIds)) {
        throw new Error('Invalid parameters: shiftPatternId and employeeIds are required');
      }

      // First, verify the shift pattern exists
      const { data: shiftPattern, error: patternError } = await supabase
        .from('shift_templates')
        .select('id, name')
        .eq('id', shiftPatternId)
        .single();

      if (patternError) {
        console.error('Error verifying shift pattern:', patternError);
        throw new Error(`Shift pattern not found: ${patternError.message}`);
      }

      console.log('Shift pattern verified:', shiftPattern);

      // Verify all employees exist
      if (employeeIds.length > 0) {
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('id, name')
          .in('id', employeeIds);

        if (employeesError) {
          console.error('Error verifying employees:', employeesError);
          throw new Error(`Error verifying employees: ${employeesError.message}`);
        }

        if (employees.length !== employeeIds.length) {
          const foundIds = employees.map(e => e.id);
          const missingIds = employeeIds.filter(id => !foundIds.includes(id));
          throw new Error(`Some employees not found: ${missingIds.join(', ')}`);
        }

        console.log('All employees verified:', employees);
      }

      // Remove existing assignments for this pattern
      console.log('Removing existing assignments...');
      const { error: deleteError } = await supabase
        .from('shift_template_assignments')
        .delete()
        .eq('shift_template_id', shiftPatternId);

      if (deleteError) {
        console.error('Error removing existing assignments:', deleteError);
        throw new Error(`Failed to remove existing assignments: ${deleteError.message}`);
      }

      console.log('Existing assignments removed successfully');

      // Insert new assignments if any employees are selected
      if (employeeIds.length > 0) {
        const assignments = employeeIds.map(employeeId => ({
          shift_template_id: shiftPatternId,
          employee_id: employeeId,
          assigned_by: null, // Will be set by RLS/auth context if needed
          is_active: true
        }));

        console.log('Creating new assignments:', assignments);

        const { data, error: insertError } = await supabase
          .from('shift_template_assignments')
          .insert(assignments)
          .select(`
            id,
            shift_template_id,
            employee_id,
            is_active,
            created_at,
            employees!shift_template_assignments_employee_id_fkey(id, name, job_title)
          `);

        if (insertError) {
          console.error('Error creating assignments:', insertError);
          
          // Provide more specific error messages based on the error code
          if (insertError.code === '23503') {
            throw new Error('Invalid employee or shift pattern reference. Please refresh the page and try again.');
          } else if (insertError.code === '23505') {
            throw new Error('One or more employees are already assigned to this pattern.');
          } else {
            throw new Error(`Failed to create assignments: ${insertError.message}`);
          }
        }

        console.log('Successfully created assignments:', data);
        return data;
      }

      console.log('No employees to assign, returning empty array');
      return [];
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['shift_template_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['shift-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
      console.log(`Successfully assigned ${variables.employeeIds.length} employees to pattern ${variables.shiftPatternId}`);
      
      toast({
        title: "Success",
        description: `Successfully assigned ${variables.employeeIds.length} employee(s) to the shift pattern.`,
      });

      // Force a refetch after a short delay to ensure data consistency
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['shift_template_assignments'] });
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to assign employees to pattern:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign employees to the shift pattern. Please try again.",
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
      console.log('Removing employee from pattern:', { shiftPatternId, employeeId });

      // Validate inputs
      if (!shiftPatternId || !employeeId) {
        throw new Error('Both shiftPatternId and employeeId are required');
      }

      const { error } = await supabase
        .from('shift_template_assignments')
        .delete()
        .eq('shift_template_id', shiftPatternId)
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error removing employee from pattern:', error);
        throw new Error(`Failed to remove employee: ${error.message}`);
      }

      console.log('Successfully removed employee from pattern');
      return { shiftPatternId, employeeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shift_template_assignments'] });
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
        description: error instanceof Error ? error.message : "Failed to remove employee from shift pattern. Please try again.",
        variant: "destructive",
      });
    },
  });
};
