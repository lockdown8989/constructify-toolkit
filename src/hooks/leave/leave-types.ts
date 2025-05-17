
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  status: string;
  reviewer_name?: string;
  reviewer_id?: string;
}

export interface LeaveEvent {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  notes?: string;
  audit_log?: AuditLogEntry[];
  employees?: {
    name: string;
    job_title?: string;
    department?: string;
  };
}

export interface LeaveCalendar extends LeaveEvent {}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Personal' | 'Holiday' | 'Parental' | 'Other';
