
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, type EmployeeFormValues } from './employee-form-schema';
import { useAddEmployee, useUpdateEmployee, Employee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { validateRequiredFields } from './utils/formValidation';
import { transformEmployeeData } from './utils/dataTransformation';
import { useErrorHandling } from './hooks/useErrorHandling';

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
  const { toast } = useToast();
  const { error, handleError, clearError } = useErrorHandling();

  const addEmployeeMutation = useAddEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

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
      lifecycle: (employeeToEdit?.lifecycle as "Full time" | "Part time" | "Agency") || 'Full time',
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
      monday_available: employeeToEdit?.monday_available !== undefined ? employeeToEdit.monday_available : true,
      monday_start_time: employeeToEdit?.monday_start_time || '09:00',
      monday_end_time: employeeToEdit?.monday_end_time || '17:00',
      tuesday_available: employeeToEdit?.tuesday_available !== undefined ? employeeToEdit.tuesday_available : true,
      tuesday_start_time: employeeToEdit?.tuesday_start_time || '09:00',
      tuesday_end_time: employeeToEdit?.tuesday_end_time || '17:00',
      wednesday_available: employeeToEdit?.wednesday_available !== undefined ? employeeToEdit.wednesday_available : true,
      wednesday_start_time: employeeToEdit?.wednesday_start_time || '09:00',
      wednesday_end_time: employeeToEdit?.wednesday_end_time || '17:00',
      thursday_available: employeeToEdit?.thursday_available !== undefined ? employeeToEdit.thursday_available : true,
      thursday_start_time: employeeToEdit?.thursday_start_time || '09:00',
      thursday_end_time: employeeToEdit?.thursday_end_time || '17:00',
      friday_available: employeeToEdit?.friday_available !== undefined ? employeeToEdit.friday_available : true,
      friday_start_time: employeeToEdit?.friday_start_time || '09:00',
      friday_end_time: employeeToEdit?.friday_end_time || '17:00',
      saturday_available: employeeToEdit?.saturday_available !== undefined ? employeeToEdit.saturday_available : true,
      saturday_start_time: employeeToEdit?.saturday_start_time || '09:00',
      saturday_end_time: employeeToEdit?.saturday_end_time || '17:00',
      sunday_available: employeeToEdit?.sunday_available !== undefined ? employeeToEdit.sunday_available : true,
      sunday_start_time: employeeToEdit?.sunday_start_time || '09:00',
      sunday_end_time: employeeToEdit?.sunday_end_time || '17:00',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    console.log('🚀 Form submission started with values:', values);
    setIsSubmitting(true);
    clearError();

    try {
      // Validate required fields
      validateRequiredFields(values);

      // Transform the data
      const employeeData = transformEmployeeData(values);

      console.log('📋 Sanitized employee data prepared:', employeeData);

      if (employeeToEdit) {
        console.log('🔄 Updating existing employee with ID:', employeeToEdit.id);
        await updateEmployeeMutation.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData,
        });
        toast({
          title: "Employee updated successfully",
          description: "Employee information has been saved.",
        });
      } else {
        console.log('➕ Creating new employee');
        await addEmployeeMutation.mutateAsync(employeeData);
        toast({
          title: "Employee added successfully", 
          description: "New employee has been created.",
        });
      }
      
      console.log('✅ Employee save operation completed successfully');
      onSuccess();
    } catch (err) {
      handleError(err, 'Failed to save employee data');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Form submission process completed');
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
  };
};
