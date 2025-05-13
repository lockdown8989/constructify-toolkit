
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';
import { UserRole } from './auth/types';
import { useToast } from './use-toast';

export interface AuthUser extends User {
  // Adding any additional properties needed
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    roles: [],
    isAdmin: false,
    isHR: false,
    isManager: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            roles: [],
            isAdmin: false,
            isHR: false,
            isManager: false
          });
          return;
        }
        
        const user = session.user as AuthUser;
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Fetch user roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const roles = userRoles?.map(r => r.role as UserRole) || [];
        
        // Check specific roles
        const isAdmin = roles.includes('admin');
        const isHR = roles.includes('hr');
        // Map 'employer' role from DB to 'manager' in UI
        const hasManagerRole = roles.includes('manager') || roles.includes('employer');
          
        setAuthState({
          user,
          profile,
          isLoading: false,
          isAuthenticated: true,
          roles,
          isAdmin,
          isHR,
          isManager: hasManagerRole
        });
      } catch (error) {
        console.error('Error fetching auth data:', error);
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
          roles: [],
          isAdmin: false,
          isHR: false,
          isManager: false
        });
      }
    };

    fetchUserData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserData();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
          roles: [],
          isAdmin: false,
          isHR: false,
          isManager: false
        });
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [toast]);

  // Sign out handler
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authState.isAuthenticated || authState.roles.length === 0) return false;
    
    if (Array.isArray(role)) {
      return role.some(r => authState.roles.includes(r));
    }
    
    return authState.roles.includes(role);
  };

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  // Sign up handler
  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    return { data, error };
  };

  // Adding missing auth functionality
  const resetPassword = async (email: string) => {
    const origin = window.location.origin;
    const resetRedirectUrl = `${origin}/auth?reset=true`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectUrl,
    });
    
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    return { error };
  };

  return {
    ...authState,
    signOut,
    hasRole,
    resetPassword,
    updatePassword,
    signIn,
    signUp
  };
};

// Re-export the AuthProvider for backward compatibility
export { AuthProvider } from './auth/AuthProvider';
