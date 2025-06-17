
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeShiftAssignment } from '@/types/shift-patterns';

export const useEmployeeShiftAssignments = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<EmployeeShiftAssignment>({
    employee_id: '',
    shift_pattern_id: '',
    monday_shift_id: '',
    tuesday_shift_id: '',
    wednesday_shift_id: '',
    thursday_shift_id: '',
    friday_shift_id: '',
    saturday_shift_id: '',
    sunday_shift_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  const loadEmployeeShifts = async (employeeId: string) => {
    if (!employeeId || employeeId === 'undefined' || employeeId === 'null') {
      console.warn('Invalid employee ID provided to loadEmployeeShifts:', employeeId);
      return;
    }
    
    setLoadingEmployee(true);
    try {
      console.log('Loading shifts for employee:', employeeId);
      
      // First, validate that the employee exists
      const { data: employeeExists, error: employeeCheckError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', employeeId)
        .single();

      if (employeeCheckError || !employeeExists) {
        console.error('Employee validation failed:', employeeCheckError);
        toast({
          title: "Error",
          description: "Selected employee not found. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      // Use the database function for safe data retrieval
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_employee_shift_assignments', { p_employee_id: employeeId });

      if (functionError) {
        console.error('Error calling get_employee_shift_assignments:', functionError);
        
        // Fallback to direct table query if function fails
        console.log('Function failed, trying direct query');
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id,
            shift_pattern_id,
            monday_shift_id,
            tuesday_shift_id,
            wednesday_shift_id,
            thursday_shift_id,
            friday_shift_id,
            saturday_shift_id,
            sunday_shift_id
          `)
          .eq('id', employeeId)
          .single();

        if (error) {
          console.error('Error loading employee shifts:', error);
          toast({
            title: "Error",
            description: "Failed to load employee shift data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          console.log('Loaded employee data (fallback):', data);
          setAssignments({
            employee_id: data.id,
            shift_pattern_id: data.shift_pattern_id || '',
            monday_shift_id: data.monday_shift_id || '',
            tuesday_shift_id: data.tuesday_shift_id || '',
            wednesday_shift_id: data.wednesday_shift_id || '',
            thursday_shift_id: data.thursday_shift_id || '',
            friday_shift_id: data.friday_shift_id || '',
            saturday_shift_id: data.saturday_shift_id || '',
            sunday_shift_id: data.sunday_shift_id || '',
          });
        }
        return;
      }

      if (functionResult?.success) {
        const employeeData = functionResult.data;
        console.log('Loaded employee data:', employeeData);
        
        setAssignments({
          employee_id: employeeData.employee_id || '',
          shift_pattern_id: employeeData.shift_pattern_id || '',
          monday_shift_id: employeeData.monday_shift_id || '',
          tuesday_shift_id: employeeData.tuesday_shift_id || '',
          wednesday_shift_id: employeeData.wednesday_shift_id || '',
          thursday_shift_id: employeeData.thursday_shift_id || '',
          friday_shift_id: employeeData.friday_shift_id || '',
          saturday_shift_id: employeeData.saturday_shift_id || '',
          sunday_shift_id: employeeData.sunday_shift_id || '',
        });
      } else {
        console.error('Function returned unsuccessful result:', functionResult);
        toast({
          title: "Error",
          description: "Failed to load employee shift assignments.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error in loadEmployeeShifts:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading employee data.",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployee(false);
    }
  };

  const saveAssignments = async (selectedEmployee: string) => {
    if (!selectedEmployee || selectedEmployee === 'undefined' || selectedEmployee === 'null') {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving assignments using database function:', assignments);
      
      // Validate employee exists before updating
      const { data: employeeExists, error: employeeCheckError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', selectedEmployee)
        .single();

      if (employeeCheckError || !employeeExists) {
        throw new Error('Selected employee not found');
      }

      // Use the database function for safe updates
      const { data: result, error } = await supabase
        .rpc('update_employee_shift_assignments', {
          p_employee_id: selectedEmployee,
          p_shift_pattern_id: assignments.shift_pattern_id || null,
          p_monday_shift_id: assignments.monday_shift_id || null,
          p_tuesday_shift_id: assignments.tuesday_shift_id || null,
          p_wednesday_shift_id: assignments.wednesday_shift_id || null,
          p_thursday_shift_id: assignments.thursday_shift_id || null,
          p_friday_shift_id: assignments.friday_shift_id || null,
          p_saturday_shift_id: assignments.saturday_shift_id || null,
          p_sunday_shift_id: assignments.sunday_shift_id || null,
        });

      if (error) {
        console.error('Error calling update_employee_shift_assignments:', error);
        throw error;
      }

      if (result?.success) {
        toast({
          title: "Success",
          description: result.message || "Employee shift assignments updated successfully",
        });
      } else {
        throw new Error(result?.error || "Failed to update shift assignments");
      }
    } catch (error: any) {
      console.error('Error updating shift assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update shift assignments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentChange = (key: string, value: string) => {
    console.log('Assignment changed:', key, value);
    
    // Validate the assignment change
    if (typeof key !== 'string' || !key) {
      console.warn('Invalid assignment key:', key);
      return;
    }

    setAssignments(prev => ({
      ...prev,
      [key]: value || ''
    }));
  };

  const resetAssignments = () => {
    console.log('Resetting assignments');
    setAssignments({
      employee_id: '',
      shift_pattern_id: '',
      monday_shift_id: '',
      tuesday_shift_id: '',
      wednesday_shift_id: '',
      thursday_shift_id: '',
      friday_shift_id: '',
      saturday_shift_id: '',
      sunday_shift_id: '',
    });
  };

  return {
    assignments,
    isLoading,
    loadingEmployee,
    loadEmployeeShifts,
    saveAssignments,
    handleAssignmentChange,
    resetAssignments
  };
};
