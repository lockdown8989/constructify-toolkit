
import { z } from "zod";

export const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  job_title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  site: z.string().min(1, "Site is required"),
  location: z.string().optional(),
  salary: z.number().min(0, "Salary must be a positive number"),
  hourly_rate: z.number().min(0, "Hourly rate must be a positive number").optional(),
  // Use the actual database values instead of transformed ones
  lifecycle: z.enum(["Active", "Inactive", "Terminated"]),
  status: z.enum(["Active", "Inactive", "Pending"]),
  start_date: z.string(),
  shift_pattern_id: z.string().optional(),
  monday_shift_id: z.string().optional(),
  tuesday_shift_id: z.string().optional(),
  wednesday_shift_id: z.string().optional(),
  thursday_shift_id: z.string().optional(),
  friday_shift_id: z.string().optional(),
  saturday_shift_id: z.string().optional(),
  sunday_shift_id: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
