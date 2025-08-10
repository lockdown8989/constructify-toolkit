
import { z } from 'zod';

export const employeeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  job_title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  site: z.string().min(1, 'Site is required'),
  salary: z.number().min(0, 'Salary must be positive'),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').optional(),
  start_date: z.string().min(1, 'Start date is required'),
  lifecycle: z.enum(['Active', 'Inactive', 'Terminated']),
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Pending', 'Invited', 'Absent']),
  location: z.string().optional(),
  employment_type: z.enum(['Full-Time', 'Part-Time', 'Agency']).optional(),
  job_description: z.string().optional(),
  probation_end_date: z.string().optional(),
  annual_leave_days: z.number().min(0).max(365).default(20),
  sick_leave_days: z.number().min(0).max(365).default(10),
  role: z.enum(['employee', 'manager', 'admin', 'hr']).default('employee'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
