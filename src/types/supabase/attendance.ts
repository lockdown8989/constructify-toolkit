
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
}
