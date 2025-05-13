
export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: AvailabilityStatus;
  notes?: string;
  manager_notes?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
  audit_log?: any[];
  employees?: {
    name: string;
  };
}
