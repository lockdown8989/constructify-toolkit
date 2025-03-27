
import { z } from "zod";

// Define valid status options for each lifecycle stage
export const validStatusForLifecycle = {
  'Employed': ['Active', 'On Leave', 'Suspended'],
  'Onboarding': ['Pending', 'In Progress', 'Completed'],
  'Offboarding': ['Pending', 'In Progress', 'Completed'],
  'Alumni': ['Terminated', 'Retired', 'Resigned']
};

export const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  job_title: z.string().min(2, {
    message: "Job title is required.",
  }),
  department: z.string().min(2, {
    message: "Department is required.",
  }),
  site: z.string().min(2, {
    message: "Site is required.",
  }),
  salary: z.coerce.number().min(0, {
    message: "Salary must be a positive number.",
  }),
  start_date: z.string().optional(),
  lifecycle: z.string().default("Active"),
  status: z.string().default("Active"),
  annual_leave_days: z.coerce.number().min(0).default(25),
  sick_leave_days: z.coerce.number().min(0).default(10),
  location: z.string().optional(),
  avatar: z.string().optional(),
  manager_id: z.string().nullable().optional(),
  linkToCurrentUser: z.boolean().default(false),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
