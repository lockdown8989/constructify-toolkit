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
          check_in: string | null
          check_out: string | null
          date: string | null
          employee_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          status?: string | null
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
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          employee_id: string | null
          id: string
          name: string
          path: string | null
          size: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          employee_id?: string | null
          id?: string
          name: string
          path?: string | null
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          employee_id?: string | null
          id?: string
          name?: string
          path?: string | null
          size?: string | null
          updated_at?: string | null
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
          name: string
          salary: number
          sick_leave_days: number | null
          site: string
          start_date: string
          status: string
        }
        Insert: {
          annual_leave_days?: number | null
          avatar?: string | null
          department: string
          id?: string
          job_title: string
          lifecycle?: string
          location?: string | null
          name: string
          salary: number
          sick_leave_days?: number | null
          site: string
          start_date?: string
          status?: string
        }
        Update: {
          annual_leave_days?: number | null
          avatar?: string | null
          department?: string
          id?: string
          job_title?: string
          lifecycle?: string
          location?: string | null
          name?: string
          salary?: number
          sick_leave_days?: number | null
          site?: string
          start_date?: string
          status?: string
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
          created_at: string | null
          department: string | null
          first_name: string | null
          id: string
          last_name: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          position?: string | null
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
          start_time: string
          title: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role:
        | {
            Args: {
              _user_id: string
              _role: Database["public"]["Enums"]["app_role"]
            }
            Returns: boolean
          }
        | {
            Args: {
              _user_id: string
              _role: string
            }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "hr" | "employee" | "employer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
