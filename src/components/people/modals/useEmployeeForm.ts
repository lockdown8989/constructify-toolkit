
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
      // First validate the form data
      const validatedData = employeeFormSchema.parse(values);
      console.log('✅ Form validation passed:', validatedData);

      // Prepare employee data with proper type handling
      const employeeData = {
        name: validatedData.name.trim(),
        email: validatedData.email?.trim() || null,
        job_title: validatedData.job_title.trim(),
        department: validatedData.department.trim(),
        site: validatedData.site.trim(),
        location: validatedData.location?.trim() || null,
        salary: Number(validatedData.salary) || 0,
        hourly_rate: Number(validatedData.hourly_rate) || 0,
        start_date: validatedData.start_date || new Date().toISOString().split('T')[0],
        status: validatedData.status || 'Active',
        lifecycle: validatedData.lifecycle || 'Active',
        role: 'employee',
        shift_pattern_id: validatedData.shift_pattern_id?.trim() || null,
        monday_shift_id: validatedData.monday_shift_id?.trim() || null,
        tuesday_shift_id: validatedData.tuesday_shift_id?.trim() || null,
        wednesday_shift_id: validatedData.wednesday_shift_id?.trim() || null,
        thursday_shift_id: validatedData.thursday_shift_id?.trim() || null,
        friday_shift_id: validatedData.friday_shift_id?.trim() || null,
        saturday_shift_id: validatedData.saturday_shift_id?.trim() || null,
        sunday_shift_id: validatedData.sunday_shift_id?.trim() || null,
        // Weekly availability
        monday_available: Boolean(validatedData.monday_available),
        monday_start_time: validatedData.monday_start_time || '09:00',
        monday_end_time: validatedData.monday_end_time || '17:00',
        tuesday_available: Boolean(validatedData.tuesday_available),
        tuesday_start_time: validatedData.tuesday_start_time || '09:00',
        tuesday_end_time: validatedData.tuesday_end_time || '17:00',
        wednesday_available: Boolean(validatedData.wednesday_available),
        wednesday_start_time: validatedData.wednesday_start_time || '09:00',
        wednesday_end_time: validatedData.wednesday_end_time || '17:00',
        thursday_available: Boolean(validatedData.thursday_available),
        thursday_start_time: validatedData.thursday_start_time || '09:00',
        thursday_end_time: validatedData.thursday_end_time || '17:00',
        friday_available: Boolean(validatedData.friday_available),
        friday_start_time: validatedData.friday_start_time || '09:00',
        friday_end_time: validatedData.friday_end_time || '17:00',
        saturday_available: Boolean(validatedData.saturday_available),
        saturday_start_time: validatedData.saturday_start_time || '09:00',
        saturday_end_time: validatedData.saturday_end_time || '17:00',
        sunday_available: Boolean(validatedData.sunday_available),
        sunday_start_time: validatedData.sunday_start_time || '09:00',
        sunday_end_time: validatedData.sunday_end_time || '17:00',
      };

      console.log('📋 Prepared employee data:', employeeData);

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

      // Handle specific validation errors
      if (errorMessage.includes('Invalid time format')) {
        errorMessage = 'Please check that all time fields use the format HH:MM (e.g., 09:00)';
      } else if (errorMessage.includes('required')) {
        errorMessage = 'Please fill in all required fields (Name, Job Title, Department, Site)';
      } else if (errorMessage.includes('violates check constraint')) {
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
