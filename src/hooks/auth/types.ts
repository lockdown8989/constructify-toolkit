
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
  deleteAccount?: () => Promise<{ success: boolean; error?: string }>;
}

export const isAuthenticated = () => {
  // This should be used as a utility function
  // The actual auth state should be accessed through useAuth hook
  return false;
};
