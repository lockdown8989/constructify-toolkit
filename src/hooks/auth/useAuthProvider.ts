// Core authentication provider hook
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AuthContextValue, 
  AuthResult, 
  SignUpMetadata,
  UserRole 
} from '@/lib/auth/types';
import { fetchUserRoles, RoleData } from '@/lib/auth/roles';
import { getAuthErrorMessage, getRedirectUrl } from '@/lib/auth/utils';

export const useAuthProvider = (): AuthContextValue => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleData, setRoleData] = useState<RoleData>({
    isAdmin: false,
    isHR: false,
    isManager: false,
    isEmployee: false,
    isPayroll: false,
    userRole: null,
    roles: [],
  });
  const [rolesLoaded, setRolesLoaded] = useState(false);
  
  const { toast } = useToast();

  // Load user roles when user changes
  const loadUserRoles = useCallback(async (userId: string) => {
    try {
      setRolesLoaded(false);
      const roles = await fetchUserRoles(userId);
      setRoleData(roles);
      setRolesLoaded(true);
    } catch (error) {
      console.error('Failed to load user roles:', error);
      setRolesLoaded(true);
    }
  }, []);

  // Initialize auth state and set up listeners
  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserRoles(session.user.id);
        } else {
          setRoleData({
            isAdmin: false,
            isHR: false,
            isManager: false,
            isEmployee: false,
            isPayroll: false,
            userRole: null,
            roles: [],
          });
          setRolesLoaded(false);
        }

        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await loadUserRoles(initialSession.user.id);
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserRoles]);

  // Sign in method
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const message = getAuthErrorMessage(error);
        toast({
          title: "Sign In Failed",
          description: message,
          variant: "destructive",
        });
        return { error, success: false, message };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { data, success: true };
    } catch (error) {
      const message = getAuthErrorMessage(error as Error);
      toast({
        title: "Sign In Error",
        description: message,
        variant: "destructive",
      });
      return { error: error as any, success: false, message };
    }
  }, [toast]);

  // Sign up method
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: SignUpMetadata
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        const message = getAuthErrorMessage(error);
        toast({
          title: "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
        return { error, success: false, message };
      }

      // If user needs email confirmation
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      }

      return { data, success: true };
    } catch (error) {
      const message = getAuthErrorMessage(error as Error);
      toast({
        title: "Sign Up Error",
        description: message,
        variant: "destructive",
      });
      return { error: error as any, success: false, message };
    }
  }, [toast]);

  // Sign out method
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: getAuthErrorMessage(error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
      
      // Clear local state regardless of API response
      setUser(null);
      setSession(null);
      setRoleData({
        isAdmin: false,
        isHR: false,
        isManager: false,
        isEmployee: false,
        isPayroll: false,
        userRole: null,
        roles: [],
      });
      setRolesLoaded(false);
      
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Reset password method
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: getRedirectUrl(),
      });

      if (error) {
        const message = getAuthErrorMessage(error);
        toast({
          title: "Reset Password Failed",
          description: message,
          variant: "destructive",
        });
        return { error, success: false, message };
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

      return { success: true };
    } catch (error) {
      const message = getAuthErrorMessage(error as Error);
      toast({
        title: "Reset Password Error",
        description: message,
        variant: "destructive",
      });
      return { error: error as any, success: false, message };
    }
  }, [toast]);

  // Update password method
  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        const message = getAuthErrorMessage(error);
        toast({
          title: "Update Password Failed",
          description: message,
          variant: "destructive",
        });
        return { error, success: false, message };
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      return { success: true };
    } catch (error) {
      const message = getAuthErrorMessage(error as Error);
      toast({
        title: "Update Password Error",
        description: message,
        variant: "destructive",
      });
      return { error: error as any, success: false, message };
    }
  }, [toast]);

  // Refresh session method
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
      } else if (session) {
        setSession(session);
        setUser(session.user);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, []);

  return {
    // Auth state
    user,
    session,
    isLoading: isLoading || (user && !rolesLoaded),
    isAuthenticated: !!user,
    
    // Role state
    ...roleData,
    rolesLoaded,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  };
};