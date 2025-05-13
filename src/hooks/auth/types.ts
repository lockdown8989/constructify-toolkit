
import { User, Session } from "@supabase/supabase-js";

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{
    error: any;
    data?: any;
    requiresConfirmation?: boolean;
  }>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}

// Map UI role names to database role names
export const mapUIRoleToDBRole = (uiRole: UserRole): string => {
  switch (uiRole) {
    case 'manager': return 'employer';
    case 'admin': return 'admin';
    case 'hr': return 'hr';
    case 'employee': 
    default: return 'employee';
  }
};

// Map database role names to UI role names
export const mapDBRoleToUIRole = (dbRole: string): UserRole => {
  switch (dbRole) {
    case 'employer': return 'manager';
    case 'admin': return 'admin';
    case 'hr': return 'hr';
    case 'employee':
    default: return 'employee';
  }
};
