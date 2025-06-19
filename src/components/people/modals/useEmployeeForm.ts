
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
    setError(null);

    try {
      // Sanitize and prepare data
      const sanitizeString = (str: any): string | null => {
        if (typeof str !== 'string') return null;
        const trimmed = str.trim();
        return trimmed === '' ? null : trimmed;
      };

      const sanitizeNumber = (num: any): number => {
        if (typeof num === 'number' && !isNaN(num)) return num;
        if (typeof num === 'string') {
          const parsed = parseFloat(num);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      const ensureBoolean = (val: any): boolean => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return Boolean(val);
      };

      const ensureTimeString = (time: any): string => {
        if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
          return time;
        }
        return '09:00';
      };

      // Validate required fields
      if (!values.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!values.job_title?.trim()) {
        throw new Error('Job title is required');
      }
      if (!values.department?.trim()) {
        throw new Error('Department is required');
      }
      if (!values.site?.trim()) {
        throw new Error('Site is required');
      }

      // Create the employee data object
      const employeeData = {
        name: values.name.trim(),
        email: sanitizeString(values.email),
        job_title: values.job_title.trim(),
        department: values.department.trim(),
        site: values.site.trim(),
        location: sanitizeString(values.location),
        salary: sanitizeNumber(values.salary),
        hourly_rate: sanitizeNumber(values.hourly_rate),
        start_date: values.start_date || new Date().toISOString().split('T')[0],
        status: values.status || 'Active',
        lifecycle: values.lifecycle || 'Active',
        role: 'employee',
        shift_pattern_id: sanitizeString(values.shift_pattern_id),
        monday_shift_id: sanitizeString(values.monday_shift_id),
        tuesday_shift_id: sanitizeString(values.tuesday_shift_id),
        wednesday_shift_id: sanitizeString(values.wednesday_shift_id),
        thursday_shift_id: sanitizeString(values.thursday_shift_id),
        friday_shift_id: sanitizeString(values.friday_shift_id),
        saturday_shift_id: sanitizeString(values.saturday_shift_id),
        sunday_shift_id: sanitizeString(values.sunday_shift_id),
        // Weekly availability
        monday_available: ensureBoolean(values.monday_available),
        monday_start_time: ensureTimeString(values.monday_start_time),
        monday_end_time: ensureTimeString(values.monday_end_time),
        tuesday_available: ensureBoolean(values.tuesday_available),
        tuesday_start_time: ensureTimeString(values.tuesday_start_time),
        tuesday_end_time: ensureTimeString(values.tuesday_end_time),
        wednesday_available: ensureBoolean(values.wednesday_available),
        wednesday_start_time: ensureTimeString(values.wednesday_start_time),
        wednesday_end_time: ensureTimeString(values.wednesday_end_time),
        thursday_available: ensureBoolean(values.thursday_available),
        thursday_start_time: ensureTimeString(values.thursday_start_time),
        thursday_end_time: ensureTimeString(values.thursday_end_time),
        friday_available: ensureBoolean(values.friday_available),
        friday_start_time: ensureTimeString(values.friday_start_time),
        friday_end_time: ensureTimeString(values.friday_end_time),
        saturday_available: ensureBoolean(values.saturday_available),
        saturday_start_time: ensureTimeString(values.saturday_start_time),
        saturday_end_time: ensureTimeString(values.saturday_end_time),
        sunday_available: ensureBoolean(values.sunday_available),
        sunday_start_time: ensureTimeString(values.sunday_start_time),
        sunday_end_time: ensureTimeString(values.sunday_end_time),
      };

      console.log('📋 Sanitized employee data prepared:', employeeData);

      if (employeeToEdit) {
        console.log('🔄 Updating existing employee with ID:', employeeToEdit.id);
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...employeeData,
        });
        toast({
          title: "Employee updated successfully",
          description: "Employee information has been saved.",
        });
      } else {
        console.log('➕ Creating new employee');
        await addEmployee.mutateAsync(employeeData);
        toast({
          title: "Employee added successfully", 
          description: "New employee has been created.",
        });
      }
      
      console.log('✅ Employee save operation completed successfully');
      onSuccess();
    } catch (err) {
      console.error('❌ Error submitting employee form:', err);
      
      let errorMessage = 'Failed to save employee data';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error details:', err);
      }

      // Handle specific database errors
      if (errorMessage.includes('violates check constraint')) {
        errorMessage = 'Invalid data format. Please check your input values.';
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = 'An employee with this information already exists.';
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
