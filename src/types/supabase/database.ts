
import { Json } from '@/integrations/supabase/types';
import type { 
  Employee, 
  EmployeeComposition 
} from './employees';
import type { 
  OpenShiftType, 
  OpenShiftAssignment, 
  Schedule, 
  ShiftSwap 
} from './schedules';
import type { 
  Notification, 
  NotificationSetting, 
  WorkflowNotification 
} from './notifications';
import type { 
  AvailabilityRequest, 
  LeaveCalendar 
} from './leave';
import type { 
  Profile, 
  UserRole 
} from './auth';

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id'> & { id?: string };
        Update: Partial<Employee>;
        Relationships: [];
      };
      employee_composition: {
        Row: EmployeeComposition;
        Insert: Omit<EmployeeComposition, 'id'> & { id?: string };
        Update: Partial<EmployeeComposition>;
        Relationships: [];
      };
      open_shifts: {
        Row: OpenShiftType;
        Insert: Omit<OpenShiftType, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<OpenShiftType>;
        Relationships: [];
      };
      open_shift_assignments: {
        Row: OpenShiftAssignment;
        Insert: Omit<OpenShiftAssignment, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<OpenShiftAssignment>;
        Relationships: [];
      };
      schedules: {
        Row: Schedule;
        Insert: Omit<Schedule, 'id'> & { id?: string };
        Update: Partial<Schedule>;
        Relationships: [];
      };
      shift_swaps: {
        Row: ShiftSwap;
        Insert: Omit<ShiftSwap, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<ShiftSwap>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Notification>;
        Relationships: [];
      };
      notification_settings: {
        Row: NotificationSetting;
        Insert: Omit<NotificationSetting, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<NotificationSetting>;
        Relationships: [];
      };
      workflow_notifications: {
        Row: WorkflowNotification;
        Insert: Omit<WorkflowNotification, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<WorkflowNotification>;
        Relationships: [];
      };
      availability_requests: {
        Row: AvailabilityRequest;
        Insert: Omit<AvailabilityRequest, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<AvailabilityRequest>;
        Relationships: [];
      };
      leave_calendar: {
        Row: LeaveCalendar;
        Insert: Omit<LeaveCalendar, 'id'> & { id?: string };
        Update: Partial<LeaveCalendar>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
        Relationships: [];
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<UserRole>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: 'admin' | 'employee' | 'manager';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type { Json } from '@/integrations/supabase/types';
