
export interface EmployeeModel {
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
}

export interface InterviewModel {
  id: string;
  candidate_name: string;
  progress: number;
  stage: string;
}

export interface PayrollModel {
  id: string;
  employee_id: string;
  salary_paid: number;
  payment_status: string;
  payment_date: string;
}

export interface AttendanceModel {
  id: string;
  employee_id: string;
  check_in: string;
  check_out?: string;
  status: string;
  date: string;
}

export interface ScheduleModel {
  id: string;
  employee_id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface EmployeeCompositionModel {
  id: string;
  total_employees: number;
  male_percentage: number;
  female_percentage: number;
  updated_at: string;
}
