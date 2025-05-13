
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './auth/types';
import { useToast } from './use-toast';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    roles: [],
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
          });
          return;
        }
        
        const user = session.user;
        
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
          
        setAuthState({
          user,
          profile,
          isLoading: false,
          isAuthenticated: true,
          roles,
        });
      } catch (error) {
        console.error('Error fetching auth data:', error);
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
          roles: [],
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

  // Check if user is manager (employer, admin, or hr)
  const isManager = (): boolean => {
    return hasRole(['employer', 'admin', 'hr']);
  };

  return {
    ...authState,
    signOut,
    hasRole,
    isManager,
  };
};
