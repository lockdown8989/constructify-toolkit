
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
      lifecycle: (employeeToEdit?.lifecycle as any) || 'active',
      status: (employeeToEdit?.status as any) || 'active',
      start_date: employeeToEdit?.start_date || new Date().toISOString().split('T')[0],
      shift_pattern_id: employeeToEdit?.shift_pattern_id || '',
      monday_shift_id: employeeToEdit?.monday_shift_id || '',
      tuesday_shift_id: employeeToEdit?.tuesday_shift_id || '',
      wednesday_shift_id: employeeToEdit?.wednesday_shift_id || '',
      thursday_shift_id: employeeToEdit?.thursday_shift_id || '',
      friday_shift_id: employeeToEdit?.friday_shift_id || '',
      saturday_shift_id: employeeToEdit?.saturday_shift_id || '',
      sunday_shift_id: employeeToEdit?.sunday_shift_id || '',
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
        status: values.status === 'active' ? 'Active' : values.status === 'inactive' ? 'Inactive' : 'Pending',
        lifecycle: values.lifecycle === 'active' ? 'Active' : values.lifecycle === 'inactive' ? 'Inactive' : 'Terminated',
        role: 'employee',
        shift_pattern_id: values.shift_pattern_id || null,
        monday_shift_id: values.monday_shift_id || null,
        tuesday_shift_id: values.tuesday_shift_id || null,
        wednesday_shift_id: values.wednesday_shift_id || null,
        thursday_shift_id: values.thursday_shift_id || null,
        friday_shift_id: values.friday_shift_id || null,
        saturday_shift_id: values.saturday_shift_id || null,
        sunday_shift_id: values.sunday_shift_id || null,
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
