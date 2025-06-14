import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, EmployeeFormValues } from './employee-form-schema';
import { useCreateEmployee, useUpdateEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeForm = (
  departments: string[],
  sites: string[],
  onSuccess: () => void,
  employeeToEdit?: DbEmployee
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employeeToEdit?.name || '',
      email: employeeToEdit?.email || '',
      phone: employeeToEdit?.phone || '',
      job_title: employeeToEdit?.job_title || '',
      department: employeeToEdit?.department || '',
      site: employeeToEdit?.site || '',
      location: employeeToEdit?.location || '',
      salary: employeeToEdit?.salary || undefined,
      hourly_rate: employeeToEdit?.hourly_rate || undefined,
      lifecycle: employeeToEdit?.lifecycle || 'full-time',
      status: employeeToEdit?.status || 'active',
      start_date: employeeToEdit?.start_date || '',
    },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        salary: data.salary || 0,
        hourly_rate: data.hourly_rate || 0,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : new Date().toISOString(),
      };

      if (employeeToEdit) {
        // Update employee
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...payload,
        });
        toast({
          title: "Employee updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create employee
        await createEmployee.mutateAsync(payload);
        toast({
          title: "Employee created",
          description: `${data.name} has been created successfully.`,
        });
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating/updating employee:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create/update employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, isSubmitting, onSubmit };
};
