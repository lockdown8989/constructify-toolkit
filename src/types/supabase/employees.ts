
export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  hourly_rate?: number;
  start_date: string;
  lifecycle: string;
  status: string;
  avatar?: string;
  location?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  user_id?: string;
  manager_id?: string;
  role?: string;
  email?: string;
  employment_type?: string;
  job_description?: string;
  probation_end_date?: string;
  shift_pattern_id?: string;
  monday_shift_id?: string;
  tuesday_shift_id?: string;
  wednesday_shift_id?: string;
  thursday_shift_id?: string;
  friday_shift_id?: string;
  saturday_shift_id?: string;
  sunday_shift_id?: string;
  
  // Weekly availability fields
  monday_available?: boolean;
  monday_start_time?: string;
  monday_end_time?: string;
  tuesday_available?: boolean;
  tuesday_start_time?: string;
  tuesday_end_time?: string;
  wednesday_available?: boolean;
  wednesday_start_time?: string;
  wednesday_end_time?: string;
  thursday_available?: boolean;
  thursday_start_time?: string;
  thursday_end_time?: string;
  friday_available?: boolean;
  friday_start_time?: string;
  friday_end_time?: string;
  saturday_available?: boolean;
  saturday_start_time?: string;
  saturday_end_time?: string;
  sunday_available?: boolean;
  sunday_start_time?: string;
  sunday_end_time?: string;
}

export interface EmployeeComposition {
  id: string;
  total_employees: number;
  female_percentage: number | null;
  male_percentage: number | null;
  updated_at: string;
}
