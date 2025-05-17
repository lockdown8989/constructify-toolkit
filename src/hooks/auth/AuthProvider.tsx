import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useRoles } from "./useRoles";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType } from "./types";
import { toast } from "@/components/ui/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isHR, isManager, fetchUserRoles, resetRoles } = useRoles(user);
  const { signIn, signUp, resetPassword, updatePassword, signOut: authSignOut, deleteAccount: authDeleteAccount } = useAuthActions();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // First check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData?.session?.user?.email);
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          
          if (sessionData.session.user) {
            await fetchUserRoles(sessionData.session.user.id);
          }
        }
        
        setIsLoading(false);
        
        // Then set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Defer fetching roles with setTimeout to avoid potential deadlocks
              setTimeout(() => {
                fetchUserRoles(session.user.id);
              }, 0);
              
              // Ensure employee record exists for this user
              setTimeout(() => {
                ensureEmployeeRecord(session.user);
              }, 100);
            } else {
              resetRoles();
            }
            
            setIsLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

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
          
        // Check user roles directly
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
            
        if (roleError) {
          console.error("Error checking user roles:", roleError);
          return;
        }
            
        // Determine role and department
        const roles = roleData?.map(r => r.role) || [];
        const isManagerRole = roles.includes('employer');
        const isAdminRole = roles.includes('admin');
        const isHRRole = roles.includes('hr');
        
        // Determine department based on role
        let department = 'General';
        let jobTitle = 'Employee';
        
        if (isAdminRole) {
          department = 'Administration';
          jobTitle = 'Administrator';
        }
        else if (isHRRole) {
          department = 'HR';
          jobTitle = 'HR Specialist';
        }
        else if (isManagerRole) {
          department = 'Management';
          jobTitle = 'Manager';
        }
        
        // Create employee record
        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            user_id: user.id,
            name: fullName,
            job_title: jobTitle,
            department: department,
            site: 'Main Office',
            salary: 50000,
            status: 'Active',
            annual_leave_days: 20,
            sick_leave_days: 10
          });
          
        if (insertError) {
          console.error("Error creating employee record:", insertError);
          toast({
            title: "Error",
            description: "Could not create your employee profile. Please contact support.",
            variant: "destructive",
          });
        } else {
          console.log("Successfully created employee record");
          toast({
            title: "Profile Created",
            description: "Your employee profile has been set up successfully.",
          });
        }
      }
    } catch (error) {
      console.error("Error in ensureEmployeeRecord:", error);
    }
  };

  // Calculate if user is authenticated
  const isAuthenticated = !!user;

  // We'll use the signOut from useAuthActions but enhance it with error handling
  const signOut = async () => {
    try {
      // Clear any cached data that might be keeping the user logged in
      resetRoles();
      setUser(null);
      setSession(null);
      
      console.log("AuthProvider: Calling authSignOut...");
      await authSignOut();
      
      // Navigate to auth with signout parameter to ensure clean state
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add delete account function
  const deleteAccount = async () => {
    try {
      const result = await authDeleteAccount();
      return result;
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Failed to delete account" };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    isHR,
    isManager,
    isAuthenticated,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
