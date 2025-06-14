
import { z } from 'zod';

export const employeeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  site: z.string().min(1, 'Site is required'),
  location: z.string().optional(),
  salary: z.number().min(0, 'Salary must be positive').optional(),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').optional(),
  lifecycle: z.enum(['full-time', 'part-time', 'agency worker', 'contractor', 'intern']).default('full-time'),
  status: z.enum(['active', 'inactive', 'pending', 'terminated']).default('active'),
  start_date: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
