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
          active_session: boolean | null
          attendance_status:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          break_end: string | null
          break_minutes: number | null
          break_start: string | null
          check_in: string | null
          check_out: string | null
          current_status: string | null
          date: string | null
          device_identifier: string | null
          device_info: string | null
          employee_id: string | null
          id: string
          last_month_status:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          location: string | null
          manager_initiated: boolean | null
          month_start_date: string | null
          notes: string | null
          on_break: boolean | null
          overtime_approved_at: string | null
          overtime_approved_by: string | null
          overtime_minutes: number | null
          overtime_status: string | null
          status: string | null
          updated_at: string | null
          working_minutes: number | null
        }
        Insert: {
          active_session?: boolean | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          break_end?: string | null
          break_minutes?: number | null
          break_start?: string | null
          check_in?: string | null
          check_out?: string | null
          current_status?: string | null
          date?: string | null
          device_identifier?: string | null
          device_info?: string | null
          employee_id?: string | null
          id?: string
          last_month_status?:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          location?: string | null
          manager_initiated?: boolean | null
          month_start_date?: string | null
          notes?: string | null
          on_break?: boolean | null
          overtime_approved_at?: string | null
          overtime_approved_by?: string | null
          overtime_minutes?: number | null
          overtime_status?: string | null
          status?: string | null
          updated_at?: string | null
          working_minutes?: number | null
        }
        Update: {
          active_session?: boolean | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          break_end?: string | null
          break_minutes?: number | null
          break_start?: string | null
          check_in?: string | null
          check_out?: string | null
          current_status?: string | null
          date?: string | null
          device_identifier?: string | null
          device_info?: string | null
          employee_id?: string | null
          id?: string
          last_month_status?:
            | Database["public"]["Enums"]["attendance_status_type"]
            | null
          location?: string | null
          manager_initiated?: boolean | null
          month_start_date?: string | null
          notes?: string | null
          on_break?: boolean | null
          overtime_approved_at?: string | null
          overtime_approved_by?: string | null
          overtime_minutes?: number | null
          overtime_status?: string | null
          status?: string | null
          updated_at?: string | null
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
      auth_events: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          email: string
          event_type: string
          id: string
          sender_email: string | null
          timestamp: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          email: string
          event_type: string
          id?: string
          sender_email?: string | null
          timestamp: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          email?: string
          event_type?: string
          id?: string
          sender_email?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      availability_patterns: {
        Row: {
          created_at: string | null
          day_of_week: number
          effective_from: string | null
          effective_until: string | null
          employee_id: string
          end_time: string
          id: string
          is_available: boolean | null
          max_hours: number | null
          preferences: Json | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          effective_from?: string | null
          effective_until?: string | null
          employee_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          max_hours?: number | null
          preferences?: Json | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          effective_from?: string | null
          effective_until?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_hours?: number | null
          preferences?: Json | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_patterns_employee_id_fkey"
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
      calendar_preferences: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          default_view: string | null
          employee_id: string
          id: string
          mobile_view_settings: Json | null
          show_weekends: boolean | null
          updated_at: string | null
          visible_hours: Json | null
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          default_view?: string | null
          employee_id: string
          id?: string
          mobile_view_settings?: Json | null
          show_weekends?: boolean | null
          updated_at?: string | null
          visible_hours?: Json | null
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          default_view?: string | null
          employee_id?: string
          id?: string
          mobile_view_settings?: Json | null
          show_weekends?: boolean | null
          updated_at?: string | null
          visible_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_preferences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      document_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          document_id: string
          due_date: string | null
          employee_id: string
          id: string
          is_required: boolean | null
          status: string
          viewed_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          document_id: string
          due_date?: string | null
          employee_id: string
          id?: string
          is_required?: boolean | null
          status?: string
          viewed_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          document_id?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          is_required?: boolean | null
          status?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_level: string
          category: string
          created_at: string | null
          document_type: string
          employee_id: string | null
          file_type: string | null
          id: string
          name: string
          path: string | null
          size: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          uploaded_by_role: string | null
          url: string | null
        }
        Insert: {
          access_level?: string
          category: string
          created_at?: string | null
          document_type: string
          employee_id?: string | null
          file_type?: string | null
          id?: string
          name: string
          path?: string | null
          size?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_role?: string | null
          url?: string | null
        }
        Update: {
          access_level?: string
          category?: string
          created_at?: string | null
          document_type?: string
          employee_id?: string | null
          file_type?: string | null
          id?: string
          name?: string
          path?: string | null
          size?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_role?: string | null
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
          email: string | null
          hourly_rate: number | null
          id: string
          job_title: string
          lifecycle: string
          location: string | null
          manager_id: string | null
          name: string
          role: string | null
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
          email?: string | null
          hourly_rate?: number | null
          id?: string
          job_title: string
          lifecycle?: string
          location?: string | null
          manager_id?: string | null
          name: string
          role?: string | null
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
          email?: string | null
          hourly_rate?: number | null
          id?: string
          job_title?: string
          lifecycle?: string
          location?: string | null
          manager_id?: string | null
          name?: string
          role?: string | null
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
      labor_analytics: {
        Row: {
          calculated_at: string | null
          calculated_by: string | null
          coverage_percentage: number | null
          created_at: string | null
          department: string | null
          id: string
          overtime_cost: number | null
          overtime_hours: number | null
          total_employees: number | null
          total_labor_cost: number | null
          total_scheduled_hours: number | null
          updated_at: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          calculated_at?: string | null
          calculated_by?: string | null
          coverage_percentage?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          overtime_cost?: number | null
          overtime_hours?: number | null
          total_employees?: number | null
          total_labor_cost?: number | null
          total_scheduled_hours?: number | null
          updated_at?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          calculated_at?: string | null
          calculated_by?: string | null
          coverage_percentage?: number | null
          created_at?: string | null
          department?: string | null
          id?: string
          overtime_cost?: number | null
          overtime_hours?: number | null
          total_employees?: number | null
          total_labor_cost?: number | null
          total_scheduled_hours?: number | null
          updated_at?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      labor_costs: {
        Row: {
          base_cost: number
          break_cost: number | null
          calculated_at: string | null
          id: string
          overtime_cost: number | null
          schedule_id: string
          total_cost: number
        }
        Insert: {
          base_cost: number
          break_cost?: number | null
          calculated_at?: string | null
          id?: string
          overtime_cost?: number | null
          schedule_id: string
          total_cost: number
        }
        Update: {
          base_cost?: number
          break_cost?: number | null
          calculated_at?: string | null
          id?: string
          overtime_cost?: number | null
          schedule_id?: string
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "labor_costs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
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
          applications_count: number | null
          auto_assign: boolean | null
          created_at: string | null
          created_by: string | null
          created_platform: string | null
          department: string | null
          drag_disabled: boolean | null
          end_time: string
          expiration_date: string | null
          id: string
          last_dragged_at: string | null
          last_dragged_by: string | null
          last_modified_platform: string | null
          location: string | null
          minimum_experience: string | null
          mobile_friendly_view: Json | null
          mobile_notification_sent: boolean | null
          notes: string | null
          notification_sent: boolean | null
          position_order: number | null
          priority: string | null
          role: string | null
          start_time: string
          status: string
          title: string
        }
        Insert: {
          applications_count?: number | null
          auto_assign?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_platform?: string | null
          department?: string | null
          drag_disabled?: boolean | null
          end_time: string
          expiration_date?: string | null
          id?: string
          last_dragged_at?: string | null
          last_dragged_by?: string | null
          last_modified_platform?: string | null
          location?: string | null
          minimum_experience?: string | null
          mobile_friendly_view?: Json | null
          mobile_notification_sent?: boolean | null
          notes?: string | null
          notification_sent?: boolean | null
          position_order?: number | null
          priority?: string | null
          role?: string | null
          start_time: string
          status?: string
          title: string
        }
        Update: {
          applications_count?: number | null
          auto_assign?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_platform?: string | null
          department?: string | null
          drag_disabled?: boolean | null
          end_time?: string
          expiration_date?: string | null
          id?: string
          last_dragged_at?: string | null
          last_dragged_by?: string | null
          last_modified_platform?: string | null
          location?: string | null
          minimum_experience?: string | null
          mobile_friendly_view?: Json | null
          mobile_notification_sent?: boolean | null
          notes?: string | null
          notification_sent?: boolean | null
          position_order?: number | null
          priority?: string | null
          role?: string | null
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      payroll: {
        Row: {
          base_pay: number | null
          bonus: number | null
          deductions: number | null
          delivered_at: string | null
          delivery_status: string | null
          document_name: string | null
          document_url: string | null
          employee_id: string | null
          id: string
          ni_contribution: number | null
          ni_number: string | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          pay_period: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          pension_contribution: number | null
          processing_date: string | null
          salary_paid: number
          tax_code: string | null
          tax_paid: number | null
          working_hours: number | null
          ytd_gross: number | null
          ytd_net: number | null
          ytd_ni: number | null
          ytd_other: number | null
          ytd_tax: number | null
        }
        Insert: {
          base_pay?: number | null
          bonus?: number | null
          deductions?: number | null
          delivered_at?: string | null
          delivery_status?: string | null
          document_name?: string | null
          document_url?: string | null
          employee_id?: string | null
          id?: string
          ni_contribution?: number | null
          ni_number?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          pay_period?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pension_contribution?: number | null
          processing_date?: string | null
          salary_paid: number
          tax_code?: string | null
          tax_paid?: number | null
          working_hours?: number | null
          ytd_gross?: number | null
          ytd_net?: number | null
          ytd_ni?: number | null
          ytd_other?: number | null
          ytd_tax?: number | null
        }
        Update: {
          base_pay?: number | null
          bonus?: number | null
          deductions?: number | null
          delivered_at?: string | null
          delivery_status?: string | null
          document_name?: string | null
          document_url?: string | null
          employee_id?: string | null
          id?: string
          ni_contribution?: number | null
          ni_number?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          pay_period?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pension_contribution?: number | null
          processing_date?: string | null
          salary_paid?: number
          tax_code?: string | null
          tax_paid?: number | null
          working_hours?: number | null
          ytd_gross?: number | null
          ytd_net?: number | null
          ytd_ni?: number | null
          ytd_other?: number | null
          ytd_tax?: number | null
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
      payroll_history: {
        Row: {
          created_at: string | null
          employee_count: number
          employee_ids: string[]
          fail_count: number
          id: string
          processed_by: string | null
          processing_date: string | null
          success_count: number
        }
        Insert: {
          created_at?: string | null
          employee_count: number
          employee_ids: string[]
          fail_count: number
          id?: string
          processed_by?: string | null
          processing_date?: string | null
          success_count: number
        }
        Update: {
          created_at?: string | null
          employee_count?: number
          employee_ids?: string[]
          fail_count?: number
          id?: string
          processed_by?: string | null
          processing_date?: string | null
          success_count?: number
        }
        Relationships: []
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
      salary_statistics: {
        Row: {
          base_salary: number
          bonus: number | null
          created_at: string | null
          deductions: number | null
          employee_id: string | null
          id: string
          month: string
          net_salary: number | null
          payment_date: string | null
          payment_status: string | null
          updated_at: string | null
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id?: string | null
          id?: string
          month?: string
          net_salary?: number | null
          payment_date?: string | null
          payment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id?: string | null
          id?: string
          month?: string
          net_salary?: number | null
          payment_date?: string | null
          payment_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_statistics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_conflicts: {
        Row: {
          conflict_details: Json
          conflict_type: string
          created_at: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          schedule_id: string
          severity: string | null
        }
        Insert: {
          conflict_details: Json
          conflict_type: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id: string
          severity?: string | null
        }
        Update: {
          conflict_details?: Json
          conflict_type?: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_conflicts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_conflicts_log: {
        Row: {
          affected_employees: string[] | null
          affected_schedules: string[] | null
          auto_detected: boolean | null
          conflict_type: string
          created_at: string | null
          description: string
          detected_at: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          affected_employees?: string[] | null
          affected_schedules?: string[] | null
          auto_detected?: boolean | null
          conflict_type: string
          created_at?: string | null
          description: string
          detected_at?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_employees?: string[] | null
          affected_schedules?: string[] | null
          auto_detected?: boolean | null
          conflict_type?: string
          created_at?: string | null
          description?: string
          detected_at?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_publications: {
        Row: {
          created_at: string | null
          employees_notified: string[] | null
          id: string
          notes: string | null
          publication_date: string | null
          published_by: string
          schedules_count: number | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          employees_notified?: string[] | null
          id?: string
          notes?: string | null
          publication_date?: string | null
          published_by: string
          schedules_count?: number | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          employees_notified?: string[] | null
          id?: string
          notes?: string | null
          publication_date?: string | null
          published_by?: string
          schedules_count?: number | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      schedule_templates: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          days_of_week: string[]
          end_time: string
          id: string
          location: string | null
          notes: string | null
          role: string | null
          shift_type: string | null
          start_time: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          days_of_week: string[]
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          role?: string | null
          shift_type?: string | null
          start_time: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: string[]
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          role?: string | null
          shift_type?: string | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          break_duration: number | null
          calendar_id: string | null
          can_be_edited: boolean | null
          color: string | null
          cost_center: string | null
          coworkers: string[] | null
          created_at: string
          created_platform: string | null
          draft_notes: string | null
          drag_disabled: boolean | null
          employee_id: string | null
          end_time: string
          estimated_cost: number | null
          hourly_rate: number | null
          id: string
          is_draft: boolean | null
          labor_cost_calculated: boolean | null
          last_dragged_at: string | null
          last_dragged_by: string | null
          last_modified_platform: string | null
          location: string | null
          manager_id: string | null
          mobile_friendly_view: Json | null
          mobile_notification_sent: boolean | null
          notes: string | null
          position_order: number | null
          published: boolean | null
          published_at: string | null
          published_by: string | null
          recurrence_pattern: Json | null
          recurring: boolean | null
          requirements: Json | null
          shift_type: string | null
          start_time: string
          status: Database["public"]["Enums"]["shift_status"] | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          calendar_id?: string | null
          can_be_edited?: boolean | null
          color?: string | null
          cost_center?: string | null
          coworkers?: string[] | null
          created_at?: string
          created_platform?: string | null
          draft_notes?: string | null
          drag_disabled?: boolean | null
          employee_id?: string | null
          end_time: string
          estimated_cost?: number | null
          hourly_rate?: number | null
          id?: string
          is_draft?: boolean | null
          labor_cost_calculated?: boolean | null
          last_dragged_at?: string | null
          last_dragged_by?: string | null
          last_modified_platform?: string | null
          location?: string | null
          manager_id?: string | null
          mobile_friendly_view?: Json | null
          mobile_notification_sent?: boolean | null
          notes?: string | null
          position_order?: number | null
          published?: boolean | null
          published_at?: string | null
          published_by?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          requirements?: Json | null
          shift_type?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          calendar_id?: string | null
          can_be_edited?: boolean | null
          color?: string | null
          cost_center?: string | null
          coworkers?: string[] | null
          created_at?: string
          created_platform?: string | null
          draft_notes?: string | null
          drag_disabled?: boolean | null
          employee_id?: string | null
          end_time?: string
          estimated_cost?: number | null
          hourly_rate?: number | null
          id?: string
          is_draft?: boolean | null
          labor_cost_calculated?: boolean | null
          last_dragged_at?: string | null
          last_dragged_by?: string | null
          last_modified_platform?: string | null
          location?: string | null
          manager_id?: string | null
          mobile_friendly_view?: Json | null
          mobile_notification_sent?: boolean | null
          notes?: string | null
          position_order?: number | null
          published?: boolean | null
          published_at?: string | null
          published_by?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean | null
          requirements?: Json | null
          shift_type?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          template_id?: string | null
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
          {
            foreignKeyName: "schedules_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "schedule_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_applications: {
        Row: {
          application_date: string | null
          created_at: string | null
          employee_id: string
          id: string
          message: string | null
          open_shift_id: string
          priority_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_date?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          message?: string | null
          open_shift_id: string
          priority_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_date?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          message?: string | null
          open_shift_id?: string
          priority_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_applications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_applications_open_shift_id_fkey"
            columns: ["open_shift_id"]
            isOneToOne: false
            referencedRelation: "open_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_requirements: {
        Row: {
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          requirement_type: string
          requirement_value: string
          schedule_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          requirement_type: string
          requirement_value: string
          schedule_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          requirement_type?: string
          requirement_value?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_requirements_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
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
      shift_templates: {
        Row: {
          break_duration: number | null
          created_at: string | null
          created_by: string | null
          days_of_week: number[]
          end_time: string
          id: string
          location: string | null
          name: string
          requirements: Json | null
          role: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          break_duration?: number | null
          created_at?: string | null
          created_by?: string | null
          days_of_week: number[]
          end_time: string
          id?: string
          location?: string | null
          name: string
          requirements?: Json | null
          role?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          break_duration?: number | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: number[]
          end_time?: string
          id?: string
          location?: string | null
          name?: string
          requirements?: Json | null
          role?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_created_by_fkey"
            columns: ["created_by"]
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
      calculate_final_salary: {
        Args: {
          base_salary: number
          total_hours: number
          overtime_hours: number
        }
        Returns: number
      }
      calculate_labor_cost: {
        Args: {
          p_schedule_id: string
          p_hourly_rate: number
          p_start_time: string
          p_end_time: string
          p_break_duration?: number
        }
        Returns: number
      }
      calculate_weekly_labor_analytics: {
        Args: { start_date: string; end_date: string; dept?: string }
        Returns: undefined
      }
      can_edit_shift: {
        Args: { shift_id: string }
        Returns: boolean
      }
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      detect_schedule_conflicts: {
        Args: { p_schedule_id: string }
        Returns: {
          conflict_type: string
          details: Json
        }[]
      }
      end_employee_break: {
        Args: { p_attendance_id: string }
        Returns: boolean
      }
      get_employee_attendance_status: {
        Args: { p_employee_id: string }
        Returns: {
          attendance_id: string
          is_clocked_in: boolean
          on_break: boolean
          check_in_time: string
          break_start_time: string
        }[]
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { _user_id: string; _role: string }
        Returns: boolean
      }
      publish_weekly_schedule: {
        Args: {
          start_date: string
          end_date: string
          notification_message?: string
        }
        Returns: Json
      }
      safe_user_signout: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      start_employee_break: {
        Args: { p_attendance_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr" | "employee" | "employer" | "manager" | "payroll"
      attendance_report_status: "pending" | "sent" | "acknowledged"
      attendance_status_type:
        | "Pending"
        | "Approved"
        | "Late"
        | "Present"
        | "Absent"
      shift_status:
        | "confirmed"
        | "pending"
        | "rejected"
        | "completed"
        | "open"
        | "employee_rejected"
        | "employee_accepted"
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
      app_role: ["admin", "hr", "employee", "employer", "manager", "payroll"],
      attendance_report_status: ["pending", "sent", "acknowledged"],
      attendance_status_type: [
        "Pending",
        "Approved",
        "Late",
        "Present",
        "Absent",
      ],
      shift_status: [
        "confirmed",
        "pending",
        "rejected",
        "completed",
        "open",
        "employee_rejected",
        "employee_accepted",
      ],
    },
  },
} as const
