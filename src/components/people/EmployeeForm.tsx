
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAddEmployee, useUpdateEmployee } from '@/hooks/use-employees';

const employeeSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  job_title: z.string().min(2, {
    message: 'Job title must be at least 2 characters.',
  }),
  department: z.string().min(2, {
    message: 'Department is required.',
  }),
  site: z.string().min(2, {
    message: 'Site/Location is required.',
  }),
  salary: z.coerce.number().positive({
    message: 'Salary must be a positive number.',
  }),
  status: z.string().default('Pending'),
});

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
    defaultValues: defaultValues || {
      name: '',
      job_title: '',
      department: '',
      site: '',
      salary: 0,
      status: 'Pending',
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
        await addEmployee.mutateAsync(values);
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="site"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site/Location</FormLabel>
              <FormControl>
                <Input placeholder="New York Office" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Salary</FormLabel>
              <FormControl>
                <Input type="number" placeholder="75000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Invited">Invited</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
