
export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  hourlyRate: number;
}

export interface StaffRole {
  id: string;
  name: string;
  employees: Employee[];
  totalHours: number;
  totalShifts: number;
}

export interface Shift {
  id: string;
  employeeId: string;
  day: string; // "monday", "tuesday", etc.
  startTime: string; // "07:00"
  endTime: string; // "12:00"
  role: string;
  notes?: string;
  hasBreak?: boolean;
  breakDuration?: number; // in minutes
  isUnavailable?: boolean;
  unavailabilityReason?: string;
}

// Updated to be compatible with OpenShiftType from Supabase
export interface OpenShift {
  id: string;
  day?: string; // Made optional to match OpenShiftType
  title: string;
  role?: string;
  startTime?: string;
  endTime?: string;
  start_time: string; // From OpenShiftType
  end_time: string; // From OpenShiftType
  notes?: string;
  location?: string;
  status?: string;
  created_at?: string;
  created_by?: string;
  mobile_friendly_view?: {
    font_size: 'small' | 'medium' | 'large';
    compact_view: boolean;
    high_contrast: boolean;
  };
  mobile_notification_sent?: boolean;
  created_platform?: string;
  last_modified_platform?: string;
  position_order?: number | null;
  drag_disabled?: boolean | null;
  last_dragged_at?: string | null;
  last_dragged_by?: string | null;
  expiration_date?: string | null;
}

export interface EmployeeShiftStats {
  employeeId: string;
  totalHours: number;
  totalShifts: number;
}

export interface DayStats {
  day: string;
  totalHours: number;
  totalCost: number;
  shifts: Shift[];
  openShifts: OpenShift[];
}

export interface WeekStats {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  totalCost: number;
  days: DayStats[];
  roles: StaffRole[];
  openShiftsTotalHours: number;
  openShiftsTotalCount: number;
}

export type ViewMode = 'week' | 'month';
