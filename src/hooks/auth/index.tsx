
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if a user has a specific role
  const checkUserRole = async (userId: string, role: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error("Error checking role:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Exception in checkUserRole:", error);
      return false;
    }
  };

  // Fetch and set user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);

      const [isAdminRole, isHRRole, isManagerRole] = await Promise.all([
        checkUserRole(userId, 'admin'),
        checkUserRole(userId, 'hr'),
        checkUserRole(userId, 'manager')
      ]);

      setIsAdmin(isAdminRole);
      setIsHR(isHRRole);
      setIsManager(isManagerRole);

      console.log("User roles:", { isAdmin: isAdminRole, isHR: isHRRole, isManager: isManagerRole });
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  // Setup user after authentication
  const setupUser = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      setSession(session);
      await fetchUserRoles(session.user.id);
      
      // Check if employee record exists, create if not
      await ensureEmployeeRecord(session.user);
    } else {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsHR(false);
      setIsManager(false);
    }
  };

  // Create employee record if not exists
  const ensureEmployeeRecord = async (user: User) => {
    try {
      // Check if employee record exists
      const { data: existingEmployee, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking employee record:", checkError);
        return;
      }

      // If employee record doesn't exist, create it
      if (!existingEmployee) {
        console.log("Creating employee record for user:", user.id);
        
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        const fullName = profile ? 
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
          user.email?.split('@')[0] || 'New Employee';
          
        // Check user roles
        const [isAdminRole, isHRRole, isManagerRole] = await Promise.all([
          checkUserRole(user.id, 'admin'),
          checkUserRole(user.id, 'hr'),
          checkUserRole(user.id, 'manager')
        ]);
        
        // Determine department based on role
        let department = 'General';
        if (isAdminRole) department = 'Administration';
        else if (isHRRole) department = 'HR';
        else if (isManagerRole) department = 'Management';
        
        // Create employee record
        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            user_id: user.id,
            name: fullName,
            job_title: isManagerRole ? 'Manager' : 'Employee',
            department: department,
            site: 'Main Office',
            salary: 50000,
            status: 'Active',
            annual_leave_days: 20,
            sick_leave_days: 10
          });
          
        if (insertError) {
          console.error("Error creating employee record:", insertError);
        } else {
          console.log("Successfully created employee record");
        }
      }
    } catch (error) {
      console.error("Error in ensureEmployeeRecord:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        await setupUser(session);
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event, session?.user?.id);
            await setupUser(session);
            
            if (event === 'SIGNED_IN' && session) {
              // Navigate to dashboard after sign in
              navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
              // Navigate to root (/) instead of /landing to avoid 404
              navigate('/');
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Sign in error:", error.message);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      // Setup user roles after successful sign in
      await setupUser(data.session);
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Exception in signIn:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });

      if (error) {
        console.error("Sign up error:", error.message);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      // Create user role based on userData.role
      if (data.user) {
        try {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: userData.role || 'employee'
            });
            
          if (roleError) {
            console.error("Error setting user role:", roleError);
          } else {
            console.log(`Role '${userData.role || 'employee'}' assigned to user ${data.user.id}`);
          }
          
          // Sign in automatically after signup
          if (data.session) {
            await setupUser(data.session);
          } else {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (signInData.session) {
              await setupUser(signInData.session);
            }
          }
        } catch (roleError) {
          console.error("Exception setting user role:", roleError);
        }
      }

      toast({
        title: "Account created successfully",
        description: "Welcome to HR Manager!",
      });
      
      // Navigate to dashboard after successful signup
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error("Exception in signUp:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsHR(false);
      setIsManager(false);
      // Navigate to root path instead of /landing
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error("Password update error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        isHR,
        isManager,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
