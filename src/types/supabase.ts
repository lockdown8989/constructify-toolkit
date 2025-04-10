
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

// Define availability request type - updated to match the database schema
export interface AvailabilityRequest {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null; // Changed to explicitly allow null to match the database schema
  status: string;
  created_at: string;
  updated_at: string;
}

// Define shift swap type - updating to match the database schema
export interface ShiftSwap {
  id: string;
  requester_id: string;
  recipient_id: string | null; // Updated to match database schema (can be null)
  requester_schedule_id: string;
  recipient_schedule_id?: string | null; // Can be null in the database
  status: string;
  notes: string | null; // Updated to explicitly allow null to match the database schema
  created_at: string;
  updated_at: string;
}

// Define notification type - fixing to allow string type values
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string; // Changed from union type to string to match database
  read: boolean;
  related_entity: string;
  related_id: string;
  created_at: string;
}

// Define webhook settings type - adding for compatibility
export interface WebhookSetting {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_type: string; // Changed from union type to string
  notify_shift_swaps: boolean;
  notify_availability: boolean;
  notify_leave: boolean;
  notify_attendance: boolean;
  created_at: string;
  updated_at: string;
}

// Use the existing Database type directly
export type Database = DatabaseType;
