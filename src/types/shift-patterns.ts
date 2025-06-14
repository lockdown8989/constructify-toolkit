
export interface ShiftPattern {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period_minutes: number;
  overtime_threshold_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeShiftAssignment {
  employee_id: string;
  shift_pattern_id?: string;
  monday_shift_id?: string;
  tuesday_shift_id?: string;
  wednesday_shift_id?: string;
  thursday_shift_id?: string;
  friday_shift_id?: string;
  saturday_shift_id?: string;
  sunday_shift_id?: string;
}

export const DAYS_OF_WEEK = [
  { key: 'monday_shift_id', label: 'Monday' },
  { key: 'tuesday_shift_id', label: 'Tuesday' },
  { key: 'wednesday_shift_id', label: 'Wednesday' },
  { key: 'thursday_shift_id', label: 'Thursday' },
  { key: 'friday_shift_id', label: 'Friday' },
  { key: 'saturday_shift_id', label: 'Saturday' },
  { key: 'sunday_shift_id', label: 'Sunday' },
] as const;
