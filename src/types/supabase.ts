
import { Database as DatabaseType } from "@/integrations/supabase/types";

export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  site: string;
  salary: number;
  start_date: string;
  lifecycle: string;
  status: string;
  avatar?: string;
  location?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
}

// Define availability request type
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Define shift swap type
export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_schedule_id: string;
  recipient_schedule_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type Database = DatabaseType;

// Additional types can be added here
