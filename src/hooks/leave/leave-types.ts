
export type LeaveEvent = {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  audit_log?: any[];
};

// Export this as LeaveCalendar for backward compatibility
export type LeaveCalendar = LeaveEvent;

export type LeaveRequest = Omit<LeaveEvent, 'id'>;
