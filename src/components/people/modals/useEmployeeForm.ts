
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

  // Set default values based on whether we're editing or creating
  const defaultValues: EmployeeFormValues = employeeToEdit ? {
    name: employeeToEdit.name || '',
    email: employeeToEdit.email || '',
    job_title: employeeToEdit.job_title || '',
    department: employeeToEdit.department || '',
    site: employeeToEdit.site || '',
    salary: employeeToEdit.salary || 0,
    hourly_rate: employeeToEdit.hourly_rate || undefined,
    start_date: employeeToEdit.start_date || new Date().toISOString().split('T')[0],
    lifecycle: (employeeToEdit.lifecycle as 'Active' | 'Inactive' | 'Terminated') || 'Active',
    status: (employeeToEdit.status as 'Active' | 'Inactive' | 'On Leave') || 'Active',
    location: (employeeToEdit.location as 'Office' | 'Remote' | 'Hybrid') || 'Office',
    annual_leave_days: employeeToEdit.annual_leave_days || 25,
    sick_leave_days: employeeToEdit.sick_leave_days || 10,
    role: (employeeToEdit.role as 'employee' | 'manager' | 'admin' | 'hr') || 'employee',
  } : {
    name: '',
    email: '',
    job_title: '',
    department: '',
    site: '',
    salary: 0,
    start_date: new Date().toISOString().split('T')[0],
    lifecycle: 'Active' as const,
    status: 'Active' as const,
    location: (defaultLocation as 'Office' | 'Remote' | 'Hybrid') || 'Office',
    annual_leave_days: 25,
    sick_leave_days: 10,
    role: 'employee' as const,
  };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const isSubmitting = addEmployee.isPending || updateEmployee.isPending;

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setError(null);
      console.log('Submitting employee form with data:', data);
      
      // Transform form data to match Employee type requirements
      const employeeData = {
        name: data.name || '',
        email: data.email || '',
        job_title: data.job_title || '',
        department: data.department || '',
        site: data.site || '',
        salary: typeof data.salary === 'number' ? data.salary : Number(data.salary) || 0,
        hourly_rate: data.hourly_rate,
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        lifecycle: data.lifecycle || 'Active',
        status: data.status || 'Active',
        location: data.location || 'Office',
        annual_leave_days: data.annual_leave_days || 25,
        sick_leave_days: data.sick_leave_days || 10,
        role: data.role || 'employee',
      };
      
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
        // Create new employee
        console.log('Creating new employee');
        await addEmployee.mutateAsync(employeeData as any);
        
        toast({
          title: "Employee added",
          description: `${employeeData.name} has been added to the team.`,
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
