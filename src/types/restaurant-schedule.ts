
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
}

export interface OpenShift {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  role: string;
  notes?: string;
  priority?: 'low' | 'normal' | 'high';
}

export type ViewMode = 'week' | 'day';
