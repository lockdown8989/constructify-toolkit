
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'employee' | 'employer' | 'admin' | 'hr' | 'manager' | 'payroll';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isPayroll: boolean;
  rolesLoaded: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn?: (email: string, password: string) => Promise<any>;
  signUp?: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword?: (email: string) => Promise<any>;
  updatePassword?: (password: string) => Promise<any>;
  deleteAccount?: () => Promise<{ success: boolean; error?: string }>;
}

export const isAuthenticated = () => {
  // This should be used as a utility function
  // The actual auth state should be accessed through useAuth hook
  return false;
};

// Map UI roles to database roles
export const mapUIRoleToDBRole = (uiRole: UserRole): string => {
  switch (uiRole) {
    case 'manager':
      return 'employer'; // 'employer' is the database representation of 'manager'
    case 'admin':
      return 'admin';
    case 'hr':
      return 'hr';
    case 'payroll':
      return 'payroll';
    case 'employee':
    default:
      return 'employee';
  }
};
