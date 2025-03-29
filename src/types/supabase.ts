import type { Database as SupabaseDatabase } from '@/integrations/supabase/types';

// Extend the Supabase Database type with our custom tables
export interface Database extends SupabaseDatabase {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          job_title: string;
          department: string;
          site: string;
          salary: number;
          start_date: string;
          lifecycle: string;
          status: string;
          avatar: string | null;
          annual_leave_days: number;
          sick_leave_days: number;
          location: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          job_title: string;
          department: string;
          site: string;
          salary: number;
          start_date?: string;
          lifecycle?: string;
          status?: string;
          avatar?: string | null;
          annual_leave_days?: number;
          sick_leave_days?: number;
          location?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          job_title?: string;
          department?: string;
          site?: string;
          salary?: number;
          start_date?: string;
          lifecycle?: string;
          status?: string;
          avatar?: string | null;
          annual_leave_days?: number;
          sick_leave_days?: number;
          location?: string | null;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          candidate_name: string;
          progress: number;
          stage: string;
        };
        Insert: {
          id?: string;
          candidate_name: string;
          progress?: number;
          stage?: string;
        };
        Update: {
          id?: string;
          candidate_name?: string;
          progress?: number;
          stage?: string;
        };
        Relationships: [];
      };
      leave_calendar: {
        Row: {
          id: string;
          employee_id: string;
          type: string;
          start_date: string;
          end_date: string;
          status: string;
          notes: string | null;
          audit_log: any | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          type: string;
          start_date: string;
          end_date: string;
          status?: string;
          notes?: string | null;
          audit_log?: any | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          type?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          notes?: string | null;
          audit_log?: any | null;
        };
        Relationships: [
          {
            foreignKeyName: "leave_calendar_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          salary_paid: number;
          payment_status: string;
          payment_date: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          salary_paid: number;
          payment_status?: string;
          payment_date?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          salary_paid?: number;
          payment_status?: string;
          payment_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          check_in: string;
          check_out: string | null;
          status: string;
          date: string | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          check_in?: string;
          check_out?: string | null;
          status?: string;
          date?: string | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          check_in?: string;
          check_out?: string | null;
          status?: string;
          date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          deadline: string;
          department: string;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          deadline: string;
          department: string;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          deadline?: string;
          department?: string;
          priority?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          position: string | null;
          department: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      employee_composition: {
        Row: {
          id: string;
          total_employees: number;
          male_percentage: number;
          female_percentage: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          total_employees: number;
          male_percentage: number;
          female_percentage: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          total_employees?: number;
          male_percentage?: number;
          female_percentage?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'hr' | 'employee' | 'employer';
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'hr' | 'employee' | 'employer';
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'hr' | 'employee' | 'employer';
          created_at?: string | null;
        };
        Relationships: [];
      };
      hiring_statistics: {
        Row: {
          id: string;
          month: string;
          year: number;
          design_count: number;
          others_count: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          month: string;
          year: number;
          design_count?: number;
          others_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          month?: string;
          year?: number;
          design_count?: number;
          others_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      shift_swaps: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          requester_schedule_id: string;
          recipient_schedule_id?: string;
          status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          recipient_id: string;
          requester_schedule_id: string;
          recipient_schedule_id?: string;
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          recipient_id?: string;
          requester_schedule_id?: string;
          recipient_schedule_id?: string;
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shift_swaps_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_requester_schedule_id_fkey";
            columns: ["requester_schedule_id"];
            isOneToOne: false;
            referencedRelation: "schedules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shift_swaps_recipient_schedule_id_fkey";
            columns: ["recipient_schedule_id"];
            isOneToOne: false;
            referencedRelation: "schedules";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_requests: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          notes?: string;
          status: 'Pending' | 'Approved' | 'Rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          notes?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          notes?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_requests_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}
