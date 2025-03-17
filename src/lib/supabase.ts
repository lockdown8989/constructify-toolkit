
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
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
          avatar?: string;
        };
        Insert: {
          id?: string;
          name: string;
          job_title: string;
          department: string;
          site: string;
          salary: number;
          start_date: string;
          lifecycle: string;
          status: string;
          avatar?: string;
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
          avatar?: string;
        };
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
          progress: number;
          stage: string;
        };
        Update: {
          id?: string;
          candidate_name?: string;
          progress?: number;
          stage?: string;
        };
      };
    };
  };
};
