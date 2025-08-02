
export interface OpenShiftType {
  id: string;
  title: string;
  role: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  location: string | null;
  status: string;
  created_at: string | null;
  created_by: string | null;
  applications_count?: number;
  priority?: string;
  department?: string;
  minimum_experience?: string;
  auto_assign?: boolean;
  notification_sent?: boolean;
  mobile_friendly_view?: {
    font_size: 'small' | 'medium' | 'large';
    compact_view: boolean;
    high_contrast: boolean;
  };
  mobile_notification_sent: boolean;
  created_platform: string;
  last_modified_platform: string;
  position_order?: number | null;
  drag_disabled?: boolean | null;
  last_dragged_at?: string | null;
  last_dragged_by?: string | null;
  expiration_date?: string | null;
  
  // Virtual property aliases for compatibility with restaurant-schedule types
  startTime?: string;
  endTime?: string;
  day?: string;
}

export interface OpenShiftAssignment {
  id: string;
  open_shift_id: string | null;
  employee_id: string | null;
  assigned_by: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ShiftApplication {
  id: string;
  open_shift_id: string;
  employee_id: string;
  application_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  message?: string;
  priority_score?: number;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LaborAnalytics {
  id: string;
  week_start_date: string;
  week_end_date: string;
  department?: string;
  total_scheduled_hours: number;
  total_labor_cost: number;
  overtime_hours: number;
  overtime_cost: number;
  total_employees: number;
  coverage_percentage: number;
  calculated_at: string;
  calculated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SchedulePublication {
  id: string;
  published_by: string;
  publication_date: string;
  week_start_date: string;
  week_end_date: string;
  schedules_count: number;
  employees_notified: string[];
  notes?: string;
  created_at: string;
}

export interface ScheduleConflictLog {
  id: string;
  conflict_type: string;
  description: string;
  affected_schedules: string[];
  affected_employees: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unresolved' | 'acknowledged' | 'resolved' | 'ignored';
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  auto_detected: boolean;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'rejected'
  | 'employee_accepted'
  | 'employee_rejected'
  | 'incomplete';

export interface Schedule {
  id: string;
  employee_id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: ScheduleStatus;
  notes?: string | null;
  location?: string | null;
  updated_at?: string | null;
  color?: string | null;
  published?: boolean;
  published_at?: string | null;
  published_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  template_id?: string | null;
  labor_cost_calculated?: boolean;
  approval_required?: boolean;
  calendar_id?: string | null;
  shift_type?: string;
  recurring?: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    days?: number[];
    end_date?: string;
  } | null;
  mobile_friendly_view?: {
    font_size: 'small' | 'medium' | 'large';
    compact_view: boolean;
    high_contrast: boolean;
  };
  mobile_notification_sent: boolean;
  created_platform: string;
  last_modified_platform: string;
  // New draft and editing fields
  is_draft?: boolean;
  draft_notes?: string | null;
  can_be_edited?: boolean;
}

export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id: string | null;
  requester_schedule_id: string;
  recipient_schedule_id?: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleWithStatus extends Schedule {
  status: ScheduleStatus;
}
