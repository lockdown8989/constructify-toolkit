export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          break_minutes: number | null
          break_start: string | null
          check_in: string | null
          check_out: string | null
          date: string | null
          device_info: string | null
          employee_id: string | null
          id: string
          location: string | null
          notes: string | null
          overtime_approved_at: string | null
          overtime_approved_by: string | null
          overtime_minutes: number | null
          overtime_status: string | null
          status: string | null
          working_minutes: number | null
        }
        Insert: {
          break_minutes?: number | null
          break_start?: string | null
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          device_info?: string | null
          employee_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          overtime_approved_at?: string | null
          overtime_approved_by?: string | null
          overtime_minutes?: number | null
          overtime_status?: string | null
          status?: string | null
          working_minutes?: number | null
        }
        Update: {
          break_minutes?: number | null
          break_start?: string | null
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          device_info?: string | null
          employee_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          overtime_approved_at?: string | null
          overtime_approved_by?: string | null
          overtime_minutes?: number | null
          overtime_status?: string | null
          status?: string | null
          working_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_requests: {
        Row: {
          audit_log: Json | null
          created_at: string
          date: string
          employee_id: string
          end_time: string
          id: string
          is_available: boolean
          manager_notes: string | null
          notes: string | null
          reviewer_id: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          audit_log?: Json | null
          created_at?: string
          date: string
          employee_id: string
          end_time: string
          id?: string
          is_available?: boolean
          manager_notes?: string | null
          notes?: string | null
          reviewer_id?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          audit_log?: Json | null
          created_at?: string
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          manager_notes?: string | null
          notes?: string | null
          reviewer_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          employee_id: string | null
          file_type: string | null
          id: string
          name: string
          path: string | null
          size: string | null
          updated_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          employee_id?: string | null
          file_type?: string | null
          id?: string
          name: string
          path?: string | null
          size?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          employee_id?: string | null
          file_type?: string | null
          id?: string
          name?: string
          path?: string | null
          size?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_composition: {
        Row: {
          female_percentage: number | null
          id: string
          male_percentage: number | null
          total_employees: number
          updated_at: string
        }
        Insert: {
          female_percentage?: number | null
          id?: string
          male_percentage?: number | null
          total_employees: number
          updated_at?: string
        }
        Update: {
          female_percentage?: number | null
          id?: string
          male_percentage?: number | null
          total_employees?: number
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          annual_leave_days: number | null
          avatar: string | null
          department: string
          id: string
          job_title: string
          lifecycle: string
          location: string | null
          manager_id: string | null
          name: string
          salary: number
          sick_leave_days: number | null
          site: string
          start_date: string
          status: string
          user_id: string | null
        }
        Insert: {
          annual_leave_days?: number | null
          avatar?: string | null
          department: string
          id?: string
          job_title: string
          lifecycle?: string
          location?: string | null
          manager_id?: string | null
          name: string
          salary: number
          sick_leave_days?: number | null
          site: string
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          annual_leave_days?: number | null
          avatar?: string | null
          department?: string
          id?: string
          job_title?: string
          lifecycle?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          salary?: number
          sick_leave_days?: number | null
          site?: string
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hiring_statistics: {
        Row: {
          created_at: string | null
          design_count: number
          id: string
          month: string
          others_count: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          design_count?: number
          id?: string
          month: string
          others_count?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          design_count?: number
          id?: string
          month?: string
          others_count?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      interviews: {
        Row: {
          candidate_name: string
          id: string
          progress: number
          stage: string
        }
        Insert: {
          candidate_name: string
          id?: string
          progress?: number
          stage?: string
        }
        Update: {
          candidate_name?: string
          id?: string
          progress?: number
          stage?: string
        }
        Relationships: []
      }
      leave_calendar: {
        Row: {
          audit_log: Json | null
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string
          type: string
        }
        Insert: {
          audit_log?: Json | null
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          type: string
        }
        Update: {
          audit_log?: Json | null
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_calendar_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          meeting_reminders: boolean
          push_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          meeting_reminders?: boolean
          push_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          meeting_reminders?: boolean
          push_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_entity: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_entity?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_entity?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      open_shift_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          open_shift_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          open_shift_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          open_shift_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_shift_assignments_open_shift_id_fkey"
            columns: ["open_shift_id"]
            isOneToOne: false
            referencedRelation: "open_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      open_shifts: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_time: string
          id: string
          location: string | null
          notes: string | null
          role: string | null
          start_time: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          role?: string | null
          start_time: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          role?: string | null
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      payroll: {
        Row: {
          document_name: string | null
          document_url: string | null
          employee_id: string | null
          id: string
          payment_date: string | null
          payment_status: string | null
          salary_paid: number
        }
        Insert: {
          document_name?: string | null
          document_url?: string | null
          employee_id?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          salary_paid: number
        }
        Update: {
          document_name?: string | null
          document_url?: string | null
          employee_id?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          salary_paid?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string | null
          department: string | null
          first_name: string | null
          id: string
          last_name: string | null
          position: string | null
          preferred_currency: string | null
          preferred_language: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          position?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          position?: string | null
          preferred_currency?: string | null
          preferred_language?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          deadline: string
          department: string
          id: string
          name: string
          priority: string
        }
        Insert: {
          created_at?: string | null
          deadline: string
          department: string
          id?: string
          name: string
          priority?: string
        }
        Update: {
          created_at?: string | null
          deadline?: string
          department?: string
          id?: string
          name?: string
          priority?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          employee_id: string | null
          end_time: string
          id: string
          location: string | null
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["shift_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swaps: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recipient_id: string | null
          recipient_schedule_id: string | null
          requester_id: string
          requester_schedule_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recipient_id?: string | null
          recipient_schedule_id?: string | null
          requester_id: string
          requester_schedule_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recipient_id?: string | null
          recipient_schedule_id?: string | null
          requester_id?: string
          requester_schedule_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_swaps_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_recipient_schedule_id_fkey"
            columns: ["recipient_schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_requester_schedule_id_fkey"
            columns: ["requester_schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          receiver_id: string
          sender_id: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          receiver_id: string
          sender_id?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      workflow_requests: {
        Row: {
          details: Json
          id: string
          request_type: string
          reviewed_by: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          details: Json
          id?: string
          request_type: string
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          details?: Json
          id?: string
          request_type?: string
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { _user_id: string; _role: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr" | "employee" | "employer"
      attendance_report_status: "pending" | "sent" | "acknowledged"
      shift_status: "confirmed" | "pending" | "rejected" | "completed" | "open"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hr", "employee", "employer"],
      attendance_report_status: ["pending", "sent", "acknowledged"],
      shift_status: ["confirmed", "pending", "rejected", "completed", "open"],
    },
  },
} as const
