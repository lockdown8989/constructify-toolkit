
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const { toast } = useToast();

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      if (roles && roles.length > 0) {
        const userRoles = roles.map(r => r.role);
        console.log("User roles found:", userRoles);
        
        // Check each role
        setIsAdmin(userRoles.includes('admin'));
        setIsHR(userRoles.includes('hr'));
        
        // Explicitly check for 'employer' role which corresponds to manager
        const hasEmployerRole = userRoles.includes('employer');
        console.log("Has employer/manager role:", hasEmployerRole);
        setIsManager(hasEmployerRole);
      } else {
        console.log("No roles found for user");
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsHR(false);
          setIsManager(false);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link",
        });
      }
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });
      }
      return { error };
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    isHR,
    isManager,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
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

export const isAuthenticated = () => {
  const session = supabase.auth.getSession();
  return !!session;
};
