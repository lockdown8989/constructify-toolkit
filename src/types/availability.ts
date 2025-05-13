
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null;
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
  audit_log: Array<{
    timestamp: string;
    old_status: string;
    new_status: string;
    reviewer_id: string | null;
  }>;
  reviewer_id: string | null;
  manager_notes: string | null;
  employees?: {
    name: string;
  };
}

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AvailabilityResponse {
  data: AvailabilityRequest[] | null;
  error: Error | null;
}
