
export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  start_date: string;
  lifecycle: string;
  status: string;
  avatar?: string;
  location?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  user_id?: string;
  manager_id?: string;
}

export interface EmployeeComposition {
  id: string;
  total_employees: number;
  female_percentage: number | null;
  male_percentage: number | null;
  updated_at: string;
}
