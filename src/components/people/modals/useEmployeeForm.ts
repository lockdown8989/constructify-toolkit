
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

  // Set default values based on whether we're editing or creating
  const defaultValues: Partial<EmployeeFormValues> = employeeToEdit ? {
    name: employeeToEdit.name,
    email: employeeToEdit.email || '',
    job_title: employeeToEdit.job_title,
    department: employeeToEdit.department,
    site: employeeToEdit.site,
    salary: employeeToEdit.salary,
    hourly_rate: employeeToEdit.hourly_rate || undefined,
    start_date: employeeToEdit.start_date,
    lifecycle: employeeToEdit.lifecycle as 'Active' | 'Inactive' | 'Terminated',
    status: employeeToEdit.status as 'Active' | 'Inactive' | 'On Leave',
    location: employeeToEdit.location as 'Office' | 'Remote' | 'Hybrid',
    annual_leave_days: employeeToEdit.annual_leave_days,
    sick_leave_days: employeeToEdit.sick_leave_days,
    role: employeeToEdit.role as 'employee' | 'manager' | 'admin' | 'hr'
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
    role: 'employee' as const
  };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues
  });

  const isSubmitting = addEmployee.isPending || updateEmployee.isPending;

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setError(null);
      
      if (employeeToEdit) {
        // Update existing employee
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...data
        });
        
        toast({
          title: "Employee updated",
          description: `${data.name} has been updated successfully.`,
          variant: "default"
        });
      } else {
        // Create new employee
        await addEmployee.mutateAsync(data);
        
        toast({
          title: "Employee added",
          description: `${data.name} has been added to the team.`,
          variant: "default"
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      toast({
        title: employeeToEdit ? "Update failed" : "Add employee failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
