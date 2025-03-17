
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
  net_salary: number;
  payment_status: string;
  payment_date: string;
}

export interface AttendanceModel {
  id: string;
  employee_id: string;
  check_in: string;
  check_out?: string;
  status: string;
}
