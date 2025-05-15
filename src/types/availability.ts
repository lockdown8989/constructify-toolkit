
export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null; // Made optional to match the database schema
  manager_notes?: string | null;
  reviewer_id?: string | null;
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
  audit_log?: {
    timestamp: string;
    old_status: AvailabilityStatus;
    new_status: AvailabilityStatus;
    reviewer_id: string;
  }[];
  employees?: {
    name: string;
    department: string;
    job_title: string;
  };
};

export type NewAvailabilityRequest = {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string | null;
  status?: AvailabilityStatus;
};

export type UpdateAvailabilityRequest = Partial<AvailabilityRequest> & { id: string };
