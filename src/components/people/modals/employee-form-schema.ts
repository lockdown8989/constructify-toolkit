
import * as z from 'zod';

// Define form schema with validation
export const employeeFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  job_title: z.string().min(2, { message: 'Job title is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  site: z.string().min(1, { message: 'Site is required' }),
  salary: z.coerce.number().min(1, { message: 'Salary must be greater than 0' }),
  lifecycle: z.string().default('Active'),
  status: z.string().default('Active'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
