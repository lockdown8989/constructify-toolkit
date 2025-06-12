
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
      phone: employeeToEdit?.phone || '',
      job_title: employeeToEdit?.job_title || '',
      department: employeeToEdit?.department || '',
      site: employeeToEdit?.site || '',
      location: employeeToEdit?.location || defaultLocation || '',
      salary: employeeToEdit?.salary || 0,
      hourly_rate: employeeToEdit?.hourly_rate || 0,
      lifecycle: employeeToEdit?.lifecycle || 'active',
      status: employeeToEdit?.status || 'active',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (employeeToEdit) {
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...values,
        });
        toast({
          title: "Employee updated",
          description: "Employee information has been successfully updated.",
        });
      } else {
        await addEmployee.mutateAsync(values);
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
