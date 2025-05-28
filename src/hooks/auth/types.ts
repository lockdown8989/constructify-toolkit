
import { User, Session } from '@supabase/supabase-js';

// Define the user role types - IMPORTANT: Database uses 'employer' while UI uses 'manager'
export type UserRole = 'admin' | 'hr' | 'employee' | 'manager';
export type DatabaseRole = 'admin' | 'hr' | 'employee' | 'employer';

// Map UI roles to database roles
export const mapUIRoleToDBRole = (role: UserRole): DatabaseRole => {
  return role === 'manager' ? 'employer' : role as DatabaseRole;
};

// Map database roles to UI roles
export const mapDBRoleToUIRole = (role: DatabaseRole): UserRole => {
  return role === 'employer' ? 'manager' : role as UserRole;
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isAuthenticated?: boolean;
  signIn?: (email: string, password: string) => Promise<any>;
  signUp?: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  resetPassword?: (email: string) => Promise<any>;
  updatePassword?: (password: string) => Promise<any>;
  signOut?: () => Promise<void>;
  deleteAccount?: () => Promise<{ success: boolean; error?: string }>;
}

// Function to check if user is authenticated
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user;
};
