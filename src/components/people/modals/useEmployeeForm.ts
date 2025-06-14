
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, EmployeeFormValues } from './employee-form-schema';
import { useAddEmployee, useUpdateEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

interface UseEmployeeFormProps {
  onSuccess: () => void;
  employeeToEdit?: DbEmployee;
  defaultLocation?: string;
}

export const useEmployeeForm = ({ onSuccess, employeeToEdit, defaultLocation }: UseEmployeeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createEmployee = useAddEmployee();
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
      location: employeeToEdit?.location || defaultLocation || '',
      salary: employeeToEdit?.salary || undefined,
      hourly_rate: employeeToEdit?.hourly_rate || undefined,
      lifecycle: (employeeToEdit?.lifecycle as "full-time" | "part-time" | "agency worker" | "contractor" | "intern") || 'full-time',
      status: (employeeToEdit?.status as "active" | "inactive" | "pending" | "terminated") || 'active',
      start_date: employeeToEdit?.start_date || '',
    },
  });

  const onSubmit = form.handleSubmit(async (data: EmployeeFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        salary: data.salary || 0,
        hourly_rate: data.hourly_rate || 0,
        start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
      const errorMessage = error instanceof Error ? error.message : "Failed to create/update employee";
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

  return { form, isSubmitting, onSubmit, error };
};
