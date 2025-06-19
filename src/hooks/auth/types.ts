
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
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
}

export const isAuthenticated = (): boolean => {
  // This function is now properly implemented in the AuthProvider context
  return false; // Default fallback - actual implementation uses context
};

export interface SecurityConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
}

export const defaultSecurityConfig: SecurityConfig = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes
  passwordMinLength: 8,
  requireEmailVerification: true
};
