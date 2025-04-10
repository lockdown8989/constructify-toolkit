
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

export interface OpenShift {
  id: string;
  day: string; // "monday", "tuesday", etc.
  startTime: string;
  endTime: string;
  role: string;
  notes?: string;
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
