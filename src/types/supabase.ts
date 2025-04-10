
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

// Define notification type - fixing the related_entity and related_id properties to match the DB schema
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_entity: string; // Changed from optional to required to match database schema
  related_id: string; // Changed from optional to required to match database schema
  created_at: string;
}

// Define webhook settings type
export interface WebhookSetting {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_type: 'slack' | 'email';
  notify_shift_swaps: boolean;
  notify_availability: boolean;
  notify_leave: boolean;
  notify_attendance: boolean;
  created_at: string;
  updated_at: string;
}

// Extend the Database type to include our new tables
export interface ExtendedDatabase extends DatabaseType {
  public: {
    Tables: {
      // Include all existing tables from DatabaseType
      attendance: DatabaseType['public']['Tables']['attendance'];
      documents: DatabaseType['public']['Tables']['documents'];
      employee_composition: DatabaseType['public']['Tables']['employee_composition'];
      employees: DatabaseType['public']['Tables']['employees'];
      hiring_statistics: DatabaseType['public']['Tables']['hiring_statistics'];
      interviews: DatabaseType['public']['Tables']['interviews'];
      leave_calendar: DatabaseType['public']['Tables']['leave_calendar'];
      payroll: DatabaseType['public']['Tables']['payroll'];
      profiles: DatabaseType['public']['Tables']['profiles'];
      projects: DatabaseType['public']['Tables']['projects'];
      schedules: DatabaseType['public']['Tables']['schedules'];
      user_roles: DatabaseType['public']['Tables']['user_roles'];
      
      // Add our new tables with compatible relationship definitions
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Notification>;
        Relationships: [] // Changed to empty array to match the base Database interface
      };
      
      webhook_settings: {
        Row: WebhookSetting;
        Insert: Omit<WebhookSetting, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<WebhookSetting>;
        Relationships: [] // Changed to empty array to match the base Database interface
      };
      
      availability_requests: {
        Row: {
          created_at: string;
          date: string;
          employee_id: string;
          end_time: string;
          id: string;
          is_available: boolean;
          notes: string | null; // Updated to match the AvailabilityRequest interface
          start_time: string;
          status: string;
          updated_at: string;
        };
        Insert: Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<AvailabilityRequest>;
        Relationships: [] // Changed to empty array to match the base Database interface
      };
      
      shift_swaps: {
        Row: ShiftSwap;
        Insert: Omit<ShiftSwap, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<ShiftSwap>;
        Relationships: [] // Changed to empty array to match the base Database interface
      };
    };
    Views: DatabaseType['public']['Views'];
    Functions: DatabaseType['public']['Functions'];
    Enums: DatabaseType['public']['Enums'];
    CompositeTypes: DatabaseType['public']['CompositeTypes'];
  };
}

export type Database = ExtendedDatabase;
