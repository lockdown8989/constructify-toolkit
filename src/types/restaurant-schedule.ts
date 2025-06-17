
export interface Employee {
  id: string;
  name: string;
  role: string;
  color: string;
  hourlyRate: number;
  maxHours?: number;
  avatarUrl?: string;
  availability: {
    monday: { available: boolean; start: string; end: string };
    tuesday: { available: boolean; start: string; end: string };
    wednesday: { available: boolean; start: string; end: string };
    thursday: { available: boolean; start: string; end: string };
    friday: { available: boolean; start: string; end: string };
    saturday: { available: boolean; start: string; end: string };
    sunday: { available: boolean; start: string; end: string };
  };
}

export interface Shift {
  id: string;
  employeeId: string;
  day: string;
  startTime: string;
  endTime: string;
  role: string;
  notes?: string;
  break?: number;
  status?: string;
  hasBreak?: boolean;
  breakDuration?: number;
  isUnavailable?: boolean;
  unavailabilityReason?: string;
}

export interface OpenShift {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  role: string;
  notes?: string;
  priority?: 'low' | 'normal' | 'high';
  title?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  expiration_date?: string;
  status?: string;
  created_platform?: string;
  last_modified_platform?: string;
  mobile_notification_sent?: boolean;
}

export interface StaffRole {
  id: string;
  name: string;
  totalHours: number;
  totalShifts: number;
  employees: Employee[];
}

export interface DayStats {
  totalHours: number;
  totalCost: number;
}

export interface WeekStats {
  weekRange: string;
  weekNumber?: number;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  totalCost: number;
  dailyHours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  dailyCosts: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  roles: StaffRole[];
  days?: { day: string; totalHours: number; totalCost: number; shifts: Shift[]; openShifts: OpenShift[]; }[];
  openShiftsTotalHours: number;
  openShiftsTotalCount: number;
}

export type ViewMode = 'week' | 'day';
