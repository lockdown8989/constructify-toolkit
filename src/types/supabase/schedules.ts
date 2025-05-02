
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

export type ScheduleStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'rejected'
  | 'employee_accepted'
  | 'employee_rejected';

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
