
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
  // Subscription state (org-level)
  subscribed?: boolean;
  subscriptionTier?: string | null;
  subscriptionEnd?: string | null;
  subscriptionStatus?: string | null;
  subscriptionIsTrial?: boolean;
  subscriptionTrialEnd?: string | null;
  refreshSubscription?: () => Promise<void>;
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

/**
 * Maps UI role names to database role names
 * @param uiRole The role name used in the UI
 * @returns The corresponding database role name
 */
export const mapUIRoleToDBRole = (uiRole: UserRole): string => {
  switch (uiRole) {
    case "manager":
      return "employer"; // "employer" is the database representation of "manager"
    case "admin":
      return "admin";
    case "hr":
      return "hr";
    case "payroll":
      return "payroll";
    case "employee":
    default:
      return "employee";
  }
};
