
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, type EmployeeFormValues } from './employee-form-schema';
import { useAddEmployee, useUpdateEmployee, Employee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

export interface UseEmployeeFormProps {
  onSuccess: () => void;
  employeeToEdit?: Employee;
  defaultLocation?: string;
}

export const useEmployeeForm = ({ 
  onSuccess, 
  employeeToEdit, 
  defaultLocation 
}: UseEmployeeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employeeToEdit?.name || '',
      email: employeeToEdit?.email || '',
      phone: '',
      job_title: employeeToEdit?.job_title || '',
      department: employeeToEdit?.department || '',
      site: employeeToEdit?.site || '',
      location: employeeToEdit?.location || defaultLocation || '',
      salary: employeeToEdit?.salary || 0,
      hourly_rate: employeeToEdit?.hourly_rate || 0,
      lifecycle: 'active',
      status: 'active',
      start_date: employeeToEdit?.start_date || new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const employeeData = {
        name: values.name,
        email: values.email,
        job_title: values.job_title,
        department: values.department,
        site: values.site,
        location: values.location,
        salary: values.salary || 0,
        hourly_rate: values.hourly_rate || 0,
        start_date: values.start_date || new Date().toISOString().split('T')[0],
        status: 'Active',
        lifecycle: 'Active',
        role: 'employee',
      };

      if (employeeToEdit) {
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData,
        });
        toast({
          title: "Employee updated",
          description: "Employee information has been successfully updated.",
        });
      } else {
        await addEmployee.mutateAsync(employeeData);
        toast({
          title: "Employee added",
          description: "New employee has been successfully added to the team.",
        });
      }
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
  };
};
