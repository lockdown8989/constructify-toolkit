
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
}

export interface InterviewModel {
  id: string;
  candidate_name: string;
  progress: number;
  stage: string;
}
