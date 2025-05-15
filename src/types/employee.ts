
export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  status: string;
  avatar?: string;
  location?: string;
  hourly_rate?: number;
  start_date?: string;
  lifecycle?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  user_id?: string;
  manager_id?: string;
  selected?: boolean;
  title?: string; // Added for compatibility with salary table components
  paymentDate?: string; // Added for compatibility with salary table components
}
