
import { z } from 'zod';

export const employeeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().min(1, 'Job title is required').max(100, 'Job title must be less than 100 characters'),
  department: z.string().min(1, 'Department is required').max(100, 'Department must be less than 100 characters'),
  site: z.string().min(1, 'Site is required').max(100, 'Site must be less than 100 characters'),
  location: z.string().optional(),
  salary: z.number().min(0, 'Salary must be positive').default(0),
  hourly_rate: z.number().min(0, 'Hourly rate must be positive').default(0),
  lifecycle: z.enum(['Active', 'Inactive', 'Terminated']).default('Active'),
  status: z.enum(['Active', 'Inactive', 'Pending']).default('Active'),
  start_date: z.string().optional(),
  shift_pattern_id: z.string().optional(),
  monday_shift_id: z.string().optional(),
  tuesday_shift_id: z.string().optional(),
  wednesday_shift_id: z.string().optional(),
  thursday_shift_id: z.string().optional(),
  friday_shift_id: z.string().optional(),
  saturday_shift_id: z.string().optional(),
  sunday_shift_id: z.string().optional(),
  
  // Weekly availability fields with proper validation
  monday_available: z.boolean().default(true),
  monday_start_time: z.string().default('09:00'),
  monday_end_time: z.string().default('17:00'),
  
  tuesday_available: z.boolean().default(true),
  tuesday_start_time: z.string().default('09:00'),
  tuesday_end_time: z.string().default('17:00'),
  
  wednesday_available: z.boolean().default(true),
  wednesday_start_time: z.string().default('09:00'),
  wednesday_end_time: z.string().default('17:00'),
  
  thursday_available: z.boolean().default(true),
  thursday_start_time: z.string().default('09:00'),
  thursday_end_time: z.string().default('17:00'),
  
  friday_available: z.boolean().default(true),
  friday_start_time: z.string().default('09:00'),
  friday_end_time: z.string().default('17:00'),
  
  saturday_available: z.boolean().default(true),
  saturday_start_time: z.string().default('09:00'),
  saturday_end_time: z.string().default('17:00'),
  
  sunday_available: z.boolean().default(true),
  sunday_start_time: z.string().default('09:00'),
  sunday_end_time: z.string().default('17:00'),
}).refine((data) => {
  // Custom validation to ensure end time is after start time for each day
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of days) {
    const available = data[`${day}_available` as keyof typeof data] as boolean;
    if (available) {
      const startTime = data[`${day}_start_time` as keyof typeof data] as string;
      const endTime = data[`${day}_end_time` as keyof typeof data] as string;
      
      if (startTime && endTime && startTime >= endTime) {
        return false;
      }
    }
  }
  
  return true;
}, {
  message: "End time must be after start time for all available days",
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
