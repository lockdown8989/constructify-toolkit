
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'payroll' | 'employer';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isPayroll: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const isAuthenticated = () => {
  // This function is provided for compatibility with older code
  // It should be avoided in favor of checking auth.user directly
  return false; // This will be overridden by the actual implementation
};
