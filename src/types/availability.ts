
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null;
  manager_notes: string | null;
  reviewer_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  audit_log: any[] | null;
  employees?: {
    name: string;
    department: string;
    job_title: string;
  };
}

export interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null;
  status?: string;
}

export interface UpdateAvailabilityRequest {
  id: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  notes?: string | null;
  manager_notes?: string | null;
  reviewer_id?: string | null;
}
