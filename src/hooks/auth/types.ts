
import { User, Session } from "@supabase/supabase-js";
import { Database } from "@/types/supabase/database";

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  position: string | null;
  preferred_currency: string | null;
  preferred_language: string | null;
  theme: string | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: Database["public"]["Enums"]["app_role"];
  created_at: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  signOut: () => Promise<void>;
}

export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user;
}

// Map UI role names to database role names
export function mapUIRoleToDBRole(role: string): Database["public"]["Enums"]["app_role"] {
  // Make sure to return values that match the Database["public"]["Enums"]["app_role"] type
  switch (role) {
    case 'admin':
      return 'admin';
    case 'hr':
      return 'hr' as Database["public"]["Enums"]["app_role"]; // Cast to ensure type compatibility
    case 'manager':
      return 'employer' as Database["public"]["Enums"]["app_role"]; // In the UI we call it 'manager', in the DB it's 'employer'
    default:
      return 'employee';
  }
}
