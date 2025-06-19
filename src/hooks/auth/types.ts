
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
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
  resetPassword: (email: string) => Promise<{ error: any; data?: any }>;
  updatePassword: (password: string) => Promise<{ error: any; data?: any }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

// Add the missing mapUIRoleToDBRole function
export const mapUIRoleToDBRole = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    'admin': 'admin',
    'hr': 'hr',
    'manager': 'employer', // 'manager' in UI maps to 'employer' in DB
    'employee': 'employee',
    'payroll': 'payroll',
    'employer': 'employer'
  };
  return roleMap[role] || 'employee'; // Default to employee if role not found
};
