
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddEmployee } from '@/hooks/use-employees';
import { employeeFormSchema, EmployeeFormValues } from './employee-form-schema';

interface UseEmployeeFormProps {
  onSuccess: () => void;
}

export const useEmployeeForm = ({ onSuccess }: UseEmployeeFormProps) => {
  const addEmployee = useAddEmployee();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: '',
      job_title: '',
      department: '',
      site: '',
      salary: 0,
      lifecycle: 'Active',
      status: 'Active',
    },
  });

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      await addEmployee.mutateAsync({
        name: values.name,
        job_title: values.job_title,
        department: values.department,
        site: values.site,
        salary: Number(values.salary),
        start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        lifecycle: 'Active', // Explicitly set to 'Active' to match the constraint
        status: 'Active', // Explicitly set to 'Active' to match the constraint
      });
      form.reset();
      onSuccess();
      setError(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while adding employee');
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: addEmployee.isPending,
    error,
  };
};
