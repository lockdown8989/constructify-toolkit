
import { User, Session } from '@supabase/supabase-js';

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
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<any>;
}

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'payroll';

export const isAuthenticated = () => {
  // This function should be used within a component that has access to useAuth
  throw new Error('isAuthenticated should be called within an auth context');
};
