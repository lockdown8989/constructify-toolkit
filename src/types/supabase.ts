
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
          avatar?: string | null;
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
    };
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}
