
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddEmployee, useUpdateEmployee, Employee } from '@/hooks/use-employees';
import { employeeFormSchema, EmployeeFormValues, validStatusForLifecycle } from './employee-form-schema';

interface UseEmployeeFormProps {
  onSuccess: () => void;
  employeeToEdit?: Employee;
}

export const useEmployeeForm = ({ onSuccess, employeeToEdit }: UseEmployeeFormProps) => {
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!employeeToEdit;
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: isEditMode 
      ? {
          name: employeeToEdit.name,
          job_title: employeeToEdit.job_title,
          department: employeeToEdit.department,
          site: employeeToEdit.site,
          salary: employeeToEdit.salary,
          lifecycle: employeeToEdit.lifecycle as any,
          status: employeeToEdit.status as any,
        }
      : {
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
      const employeeData = {
        name: values.name,
        job_title: values.job_title,
        department: values.department,
        site: values.site,
        salary: Number(values.salary),
        lifecycle: values.lifecycle,
        status: values.status,
      };

      if (isEditMode) {
        // Update existing employee
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData,
        });
      } else {
        // Add new employee
        await addEmployee.mutateAsync({
          ...employeeData,
          start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        });
      }
      
      form.reset();
      onSuccess();
      setError(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      
      // Check for duplicate employee error
      if (error instanceof Error && error.message.includes('unique_employee_name')) {
        setError(`An employee with the name "${values.name}" already exists. Please use a different name.`);
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred while saving employee');
      }
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isEditMode ? updateEmployee.isPending : addEmployee.isPending,
    error,
  };
};
