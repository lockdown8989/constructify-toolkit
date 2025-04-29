
export interface AttendanceRecord {
  id: string;
  employee_id: string | null;
  date: string | null;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  employee_name?: string;
  working_minutes?: number | null;
  overtime_minutes?: number | null;
  overtime_status?: string | null;
  overtime_approved_at?: string | null;
  overtime_approved_by?: string | null;
  break_minutes?: number | null;
  break_start?: string | null;
  location?: string | null;
  device_info?: string | null;
  notes?: string | null;
  attendance_status: 'Pending' | 'Approved' | 'Late' | 'Present' | 'Absent';
  approval_date?: string | null;
  approved_by?: string | null;
  active_session?: boolean;
  device_identifier?: string | null;
}
