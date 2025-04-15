
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
}

// Function to check if user is authenticated
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user;
};
