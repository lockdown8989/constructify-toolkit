
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddEmployee } from '@/hooks/use-employees';
import { employeeFormSchema, EmployeeFormValues, validStatusForLifecycle } from './employee-form-schema';

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
      lifecycle: 'Employed',
      status: 'Present',
    },
  });

  // Watch for lifecycle changes to update status if needed
  const lifecycle = form.watch('lifecycle');
  const status = form.watch('status');

  useEffect(() => {
    // Check if current status is valid for the selected lifecycle
    const validStatuses = validStatusForLifecycle[lifecycle];
    if (!validStatuses.includes(status as any)) {
      // Set status to first valid option for this lifecycle
      form.setValue('status', validStatuses[0]);
    }
  }, [lifecycle, status, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      await addEmployee.mutateAsync({
        name: values.name,
        job_title: values.job_title,
        department: values.department,
        site: values.site,
        salary: Number(values.salary),
        start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        lifecycle: values.lifecycle, // Use the validated lifecycle value
        status: values.status, // Use the validated status value
      });
      form.reset();
      onSuccess();
      setError(null);
    } catch (error) {
      console.error('Error adding employee:', error);
      
      // Check for duplicate employee error
      if (error instanceof Error && error.message.includes('unique_employee_name')) {
        setError(`An employee with the name "${values.name}" already exists. Please use a different name.`);
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred while adding employee');
      }
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: addEmployee.isPending,
    error,
  };
};
