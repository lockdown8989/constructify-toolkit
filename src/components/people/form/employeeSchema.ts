
import * as z from 'zod';

export const employeeSchema = z.object({
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

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
