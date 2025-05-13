
import { User } from '@supabase/supabase-js';

// Extend AuthUser with all properties from User, making some of them required to match User type
export interface AuthUser extends Omit<User, 'user_metadata' | 'app_metadata'> {
  user_metadata: User['user_metadata'];
  app_metadata: User['app_metadata'];
}

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

// Database roles can be different from UI roles
export type DBRole = 'admin' | 'hr' | 'manager' | 'employer' | 'employee';

// Map UI roles to database roles
export const mapUIRoleToDBRole = (role: UserRole): DBRole => {
  if (role === 'manager') return 'employer';
  return role;
};

// Auth context type definition
export interface AuthContextType {
  user: AuthUser | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updatePassword?: (password: string) => Promise<void>;
}

// Helper function to check if a user is authenticated
export const isAuthenticated = (user: AuthUser | null): boolean => !!user;

export interface AuthState {
  user: AuthUser | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isManager: boolean;
  isAdmin: boolean;
  isHR: boolean;
  signOut: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  updatePassword?: (password: string) => Promise<void>;
}
