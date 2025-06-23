
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, type EmployeeFormValues } from './employee-form-schema';
import { useAddEmployee, useUpdateEmployee, Employee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeAvailabilitySync } from '@/hooks/use-employee-availability-sync';

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
  const { updateAvailability } = useEmployeeAvailabilitySync();

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
      lifecycle: (employeeToEdit?.lifecycle as "Active" | "Inactive" | "Terminated" | "On Leave") || 'Active',
      status: (employeeToEdit?.status as "Active" | "Inactive" | "Pending" | "On Leave") || 'Active',
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
      // Ensure all required fields are present
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

      // Parse and validate data with proper type conversion
      const processedData = {
        name: values.name.trim(),
        email: values.email && values.email.trim() !== '' ? values.email.trim() : null,
        job_title: values.job_title.trim(),
        department: values.department.trim(),
        site: values.site.trim(),
        location: values.location && values.location.trim() !== '' ? values.location.trim() : null,
        salary: typeof values.salary === 'string' ? parseFloat(values.salary) || 0 : Number(values.salary) || 0,
        hourly_rate: typeof values.hourly_rate === 'string' ? parseFloat(values.hourly_rate) || 0 : Number(values.hourly_rate) || 0,
        start_date: values.start_date || new Date().toISOString().split('T')[0],
        status: values.status || 'Active',
        lifecycle: values.lifecycle || 'Active',
        role: 'employee',
        shift_pattern_id: values.shift_pattern_id && values.shift_pattern_id.trim() !== '' ? values.shift_pattern_id.trim() : null,
        monday_shift_id: values.monday_shift_id && values.monday_shift_id.trim() !== '' ? values.monday_shift_id.trim() : null,
        tuesday_shift_id: values.tuesday_shift_id && values.tuesday_shift_id.trim() !== '' ? values.tuesday_shift_id.trim() : null,
        wednesday_shift_id: values.wednesday_shift_id && values.wednesday_shift_id.trim() !== '' ? values.wednesday_shift_id.trim() : null,
        thursday_shift_id: values.thursday_shift_id && values.thursday_shift_id.trim() !== '' ? values.thursday_shift_id.trim() : null,
        friday_shift_id: values.friday_shift_id && values.friday_shift_id.trim() !== '' ? values.friday_shift_id.trim() : null,
        saturday_shift_id: values.saturday_shift_id && values.saturday_shift_id.trim() !== '' ? values.saturday_shift_id.trim() : null,
        sunday_shift_id: values.sunday_shift_id && values.sunday_shift_id.trim() !== '' ? values.sunday_shift_id.trim() : null,
        // Weekly availability with validation
        monday_available: Boolean(values.monday_available),
        monday_start_time: values.monday_start_time || '09:00',
        monday_end_time: values.monday_end_time || '17:00',
        tuesday_available: Boolean(values.tuesday_available),
        tuesday_start_time: values.tuesday_start_time || '09:00',
        tuesday_end_time: values.tuesday_end_time || '17:00',
        wednesday_available: Boolean(values.wednesday_available),
        wednesday_start_time: values.wednesday_start_time || '09:00',
        wednesday_end_time: values.wednesday_end_time || '17:00',
        thursday_available: Boolean(values.thursday_available),
        thursday_start_time: values.thursday_start_time || '09:00',
        thursday_end_time: values.thursday_end_time || '17:00',
        friday_available: Boolean(values.friday_available),
        friday_start_time: values.friday_start_time || '09:00',
        friday_end_time: values.friday_end_time || '17:00',
        saturday_available: Boolean(values.saturday_available),
        saturday_start_time: values.saturday_start_time || '09:00',
        saturday_end_time: values.saturday_end_time || '17:00',
        sunday_available: Boolean(values.sunday_available),
        sunday_start_time: values.sunday_start_time || '09:00',
        sunday_end_time: values.sunday_end_time || '17:00',
      };

      console.log('📋 Processed employee data:', processedData);

      if (employeeToEdit) {
        console.log('🔄 Updating existing employee with ID:', employeeToEdit.id);
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          ...processedData,
        });

        toast({
          title: "Employee updated successfully",
          description: "Employee information has been saved.",
        });
      } else {
        console.log('➕ Creating new employee');
        await addEmployee.mutateAsync(processedData);
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

      // Handle specific validation errors
      if (errorMessage.includes('Invalid time format')) {
        errorMessage = 'Please check that all time fields use the format HH:MM (e.g., 09:00)';
      } else if (errorMessage.includes('required')) {
        errorMessage = 'Please fill in all required fields (Name, Job Title, Department, Site)';
      } else if (errorMessage.includes('violates check constraint')) {
        errorMessage = 'Invalid data format. Please check your input values.';
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = 'An employee with this information already exists.';
      } else if (errorMessage.includes('invalid input syntax')) {
        errorMessage = 'Invalid data format. Please check numeric fields (salary, hourly rate).';
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
