
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
      lifecycle: (employeeToEdit?.lifecycle as "Active" | "Inactive" | "Terminated") || 'Active',
      status: (employeeToEdit?.status as "Active" | "Inactive" | "Pending") || 'Active',
      start_date: employeeToEdit?.start_date || new Date().toISOString().split('T')[0],
      shift_pattern_id: employeeToEdit?.shift_pattern_id || '',
      monday_shift_id: employeeToEdit?.monday_shift_id || '',
      tuesday_shift_id: employeeToEdit?.tuesday_shift_id || '',
      wednesday_shift_id: employeeToEdit?.wednesday_shift_id || '',
      thursday_shift_id: employeeToEdit?.thursday_shift_id || '',
      friday_shift_id: employeeToEdit?.friday_shift_id || '',
      saturday_shift_id: employeeToEdit?.saturday_shift_id || '',
      sunday_shift_id: employeeToEdit?.sunday_shift_id || '',
      // Weekly availability default values
      monday_available: employeeToEdit?.monday_available ?? true,
      monday_start_time: employeeToEdit?.monday_start_time || '09:00',
      monday_end_time: employeeToEdit?.monday_end_time || '17:00',
      tuesday_available: employeeToEdit?.tuesday_available ?? true,
      tuesday_start_time: employeeToEdit?.tuesday_start_time || '09:00',
      tuesday_end_time: employeeToEdit?.tuesday_end_time || '17:00',
      wednesday_available: employeeToEdit?.wednesday_available ?? true,
      wednesday_start_time: employeeToEdit?.wednesday_start_time || '09:00',
      wednesday_end_time: employeeToEdit?.wednesday_end_time || '17:00',
      thursday_available: employeeToEdit?.thursday_available ?? true,
      thursday_start_time: employeeToEdit?.thursday_start_time || '09:00',
      thursday_end_time: employeeToEdit?.thursday_end_time || '17:00',
      friday_available: employeeToEdit?.friday_available ?? true,
      friday_start_time: employeeToEdit?.friday_start_time || '09:00',
      friday_end_time: employeeToEdit?.friday_end_time || '17:00',
      saturday_available: employeeToEdit?.saturday_available ?? true,
      saturday_start_time: employeeToEdit?.saturday_start_time || '09:00',
      saturday_end_time: employeeToEdit?.saturday_end_time || '17:00',
      sunday_available: employeeToEdit?.sunday_available ?? true,
      sunday_start_time: employeeToEdit?.sunday_start_time || '09:00',
      sunday_end_time: employeeToEdit?.sunday_end_time || '17:00',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Form values before submission:', values);
      
      // Create the employee data object with all fields including weekly availability
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
        status: values.status,
        lifecycle: values.lifecycle,
        role: 'employee',
        shift_pattern_id: values.shift_pattern_id || null,
        monday_shift_id: values.monday_shift_id || null,
        tuesday_shift_id: values.tuesday_shift_id || null,
        wednesday_shift_id: values.wednesday_shift_id || null,
        thursday_shift_id: values.thursday_shift_id || null,
        friday_shift_id: values.friday_shift_id || null,
        saturday_shift_id: values.saturday_shift_id || null,
        sunday_shift_id: values.sunday_shift_id || null,
        // Weekly availability data - ensure all fields are included
        monday_available: values.monday_available,
        monday_start_time: values.monday_start_time,
        monday_end_time: values.monday_end_time,
        tuesday_available: values.tuesday_available,
        tuesday_start_time: values.tuesday_start_time,
        tuesday_end_time: values.tuesday_end_time,
        wednesday_available: values.wednesday_available,
        wednesday_start_time: values.wednesday_start_time,
        wednesday_end_time: values.wednesday_end_time,
        thursday_available: values.thursday_available,
        thursday_start_time: values.thursday_start_time,
        thursday_end_time: values.thursday_end_time,
        friday_available: values.friday_available,
        friday_start_time: values.friday_start_time,
        friday_end_time: values.friday_end_time,
        saturday_available: values.saturday_available,
        saturday_start_time: values.saturday_start_time,
        saturday_end_time: values.saturday_end_time,
        sunday_available: values.sunday_available,
        sunday_start_time: values.sunday_start_time,
        sunday_end_time: values.sunday_end_time,
      };

      console.log('Employee data being submitted:', employeeData);

      if (employeeToEdit) {
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData,
        });
        toast({
          title: "Employee updated successfully",
          description: "Employee information and weekly availability have been saved.",
        });
      } else {
        await addEmployee.mutateAsync(employeeData);
        toast({
          title: "Employee added successfully",
          description: "New employee has been created with their weekly availability schedule.",
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Error submitting employee form:', err);
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
