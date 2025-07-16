// Authentication types and interfaces
import { User, Session, AuthError } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'payroll' | 'employer';

export interface AuthUser extends User {
  roles?: UserRole[];
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RoleState {
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isPayroll: boolean;
  userRole: UserRole | null;
  rolesLoaded: boolean;
}

export interface AuthContextValue extends AuthState, RoleState {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  refreshSession: () => Promise<void>;
}

export interface SignUpMetadata {
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface AuthResult {
  data?: any;
  error?: AuthError | null;
  success: boolean;
  message?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export type AuthMode = 'signin' | 'signup' | 'reset' | 'recovery';

export interface AuthPageState {
  mode: AuthMode;
  isLoading: boolean;
  error: string | null;
  from: string;
}