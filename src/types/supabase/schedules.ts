
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

export interface Schedule {
  id: string;
  employee_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'rejected';
  notes?: string | null;
  location?: string | null;
  updated_at?: string | null;
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

export type ScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'rejected';

export interface ScheduleWithStatus extends Schedule {
  status: ScheduleStatus;
}
