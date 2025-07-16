
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddEmployee, useUpdateEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { EmployeeFormValues, employeeFormSchema } from './employee-form-schema';

interface UseEmployeeFormProps {
  onSuccess: () => void;
  defaultLocation?: string;
  employeeToEdit?: DbEmployee;
}

export const useEmployeeForm = ({ onSuccess, defaultLocation, employeeToEdit }: UseEmployeeFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const { toast } = useToast();

  console.log('useEmployeeForm initialized with:', { employeeToEdit, defaultLocation });

  // Safe default values with proper type checking and email synchronization
  const getDefaultValues = (): EmployeeFormValues => {
    if (employeeToEdit) {
      console.log('Setting form values for existing employee:', employeeToEdit);
      return {
        name: employeeToEdit.name || '',
        email: employeeToEdit.email || '', // Ensure email is properly synchronized
        job_title: employeeToEdit.job_title || '',
        department: employeeToEdit.department || '',
        site: employeeToEdit.site || '',
        salary: typeof employeeToEdit.salary === 'number' ? employeeToEdit.salary : 0,
        hourly_rate: employeeToEdit.hourly_rate || undefined,
        start_date: employeeToEdit.start_date || new Date().toISOString().split('T')[0],
        lifecycle: (employeeToEdit.lifecycle as 'Active' | 'Inactive' | 'Terminated') || 'Active',
        status: (employeeToEdit.status as 'Active' | 'Inactive' | 'On Leave' | 'Pending') || 'Active',
        location: employeeToEdit.location || '',
        employment_type: (employeeToEdit.employment_type as 'Full-Time' | 'Part-Time' | 'Agency') || undefined,
        job_description: employeeToEdit.job_description || undefined,
        probation_end_date: employeeToEdit.probation_end_date || undefined,
        annual_leave_days: employeeToEdit.annual_leave_days || 20,
        sick_leave_days: employeeToEdit.sick_leave_days || 10,
        role: (employeeToEdit.role as 'employee' | 'manager' | 'admin' | 'hr') || 'employee',
      };
    }

    // Default values for new employee
    return {
      name: '',
      email: '',
      job_title: '',
      department: '',
      site: '',
      salary: 0,
      start_date: new Date().toISOString().split('T')[0],
      lifecycle: 'Active' as const,
      status: 'Active' as const,
      location: defaultLocation || '',
      employment_type: undefined,
      job_description: undefined,
      probation_end_date: undefined,
      annual_leave_days: 20,
      sick_leave_days: 10,
      role: 'employee' as const,
    };
  };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange'
  });

  const isSubmitting = addEmployee.isPending || updateEmployee.isPending;

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setError(null);
      console.log('Submitting employee form with data:', data);
      
      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Employee name is required');
      }
      if (!data.job_title?.trim()) {
        throw new Error('Job title is required');
      }
      if (!data.department?.trim()) {
        throw new Error('Department is required');
      }
      if (!data.site?.trim()) {
        throw new Error('Site is required');
      }
      
      // Transform form data to match Employee type requirements with email synchronization
      const employeeData = {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        job_title: data.job_title.trim(),
        department: data.department.trim(),
        site: data.site.trim(),
        salary: Math.max(0, Number(data.salary) || 0),
        hourly_rate: data.hourly_rate && !isNaN(data.hourly_rate) ? Math.max(0, Number(data.hourly_rate)) : null,
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        lifecycle: data.lifecycle || 'Active',
        status: data.status || 'Active',
        location: data.location || null,
        employment_type: data.employment_type || 'Full-Time',
        job_description: data.job_description || null,
        probation_end_date: data.probation_end_date || null,
        annual_leave_days: Math.max(0, Math.min(365, data.annual_leave_days || 20)),
        sick_leave_days: Math.max(0, Math.min(365, data.sick_leave_days || 10)),
        role: data.role || 'employee',
      };
      
      console.log('Prepared employee data for submission:', employeeData);
      
      if (employeeToEdit) {
        // Update existing employee
        console.log('Updating employee with ID:', employeeToEdit.id);
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData
        });
        
        toast({
          title: "Employee updated",
          description: `${employeeData.name} has been updated successfully.`,
          variant: "default"
        });
      } else {
        // Create new employee - this will trigger manager notifications via the hook
        console.log('Creating new employee');
        await addEmployee.mutateAsync(employeeData as any);
        
        toast({
          title: "Employee added",
          description: `${employeeData.name} has been added to the team. Managers have been notified.`,
          variant: "default"
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: employeeToEdit ? "Update failed" : "Add employee failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    error
  };
};
