
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { EmployeeFormFields } from './form/EmployeeFormFields';
import { employeeSchema } from './form/employeeSchema';

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  employeeId?: string;
  onSuccess?: () => void;
}

export function EmployeeForm({ defaultValues, employeeId, onSuccess }: EmployeeFormProps) {
  const { toast } = useToast();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const isEditMode = !!employeeId;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      job_title: '',
      department: '',
      site: '',
      salary: 0,
      status: 'Pending',
      ...defaultValues, // Apply any provided default values on top of the base defaults
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    try {
      if (isEditMode) {
        await updateEmployee.mutateAsync({
          id: employeeId,
          ...values,
        });
        toast({
          title: 'Employee updated',
          description: 'Employee information has been successfully updated.',
        });
      } else {
        // Ensure all required fields are present
        const newEmployee = {
          name: values.name,
          job_title: values.job_title,
          department: values.department,
          site: values.site,
          salary: values.salary,
          status: values.status,
        };
        
        await addEmployee.mutateAsync(newEmployee);
        toast({
          title: 'Employee added',
          description: 'New employee has been successfully added.',
        });
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: isEditMode ? 'Failed to update employee' : 'Failed to add employee',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EmployeeFormFields control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={addEmployee.isPending || updateEmployee.isPending}
        >
          {isEditMode ? 'Update Employee' : 'Add Employee'}
        </Button>
      </form>
    </Form>
  );
}
