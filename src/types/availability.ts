
// Define availability request types
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string;
  reviewer_id?: string;
  manager_notes?: string;
  audit_log?: any;
  employees?: {
    name: string;
    department?: string;
  };
}

export interface NewAvailabilityRequest {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string;
}

export interface UpdateAvailabilityRequest {
  id: string;
  status: string;
  manager_notes?: string;
  reviewer_id?: string;
}

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';
