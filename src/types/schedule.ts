
export interface Schedule {
  id: string;
  title: string;
  start_time: string | Date;
  end_time: string | Date;
  employee_id?: string;
  notes?: string;
  location?: string;
  color?: string;
  status?: string;
  shift_type?: string;
  created_at?: string;
  updated_at?: string;
  calendar_id?: string;
}
