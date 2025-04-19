
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
}

export interface LeaveCalendar {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes: string | null;
  audit_log: any[] | null;
}
