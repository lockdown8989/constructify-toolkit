
import * as z from 'zod';

// Define valid options for lifecycle and status
const validLifecycleValues = ['Active', 'Onboarding', 'Offboarding', 'Alumni'] as const;
const validStatusValues = ['Active', 'On Leave', 'Terminated', 'Suspended'] as const;

// Define form schema with validation
export const employeeFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  job_title: z.string().min(2, { message: 'Job title is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  site: z.string().min(1, { message: 'Site is required' }),
  salary: z.coerce.number().min(1, { message: 'Salary must be greater than 0' }),
  lifecycle: z.enum(validLifecycleValues, {
    errorMap: () => ({ message: 'Please select a valid lifecycle stage' }),
  }).default('Active'),
  status: z.enum(validStatusValues, {
    errorMap: () => ({ message: 'Please select a valid employment status' }),
  }).default('Active'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
