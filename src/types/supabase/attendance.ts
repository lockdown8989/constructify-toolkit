
export interface AttendanceRecord {
  id: string;
  employee_id: string | null;
  date: string | null;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
}
