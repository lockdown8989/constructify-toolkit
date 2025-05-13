
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
  updated_at: string | null;
  manager_notes: string | null;
  reviewer_id: string | null;
  employees?: {
    name: string;
    department: string;
  };
}

export type AvailabilityStatus = 'Pending' | 'Approved' | 'Rejected';
