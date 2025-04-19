
export interface Schedule {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'completed' | 'rejected';
  location?: string;
  is_published?: boolean;
}

export type ScheduleResponse = {
  id: string;
  title: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  status?: 'confirmed' | 'pending' | 'completed' | 'rejected';
  location?: string;
  is_published?: boolean;
};
