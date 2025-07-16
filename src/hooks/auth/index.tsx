
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from './useRoles';

export type UserRole = 'employee' | 'employer' | 'admin' | 'hr' | 'manager' | 'payroll';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  isEmployee: boolean;
  isPayroll: boolean;
  userRole: UserRole | null;
  rolesLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isManager: false,
  isHR: false,
  isEmployee: false,
  isPayroll: false,
  userRole: null,
  rolesLoaded: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the roles hook with debouncing to prevent excessive re-renders
  const { isAdmin, isManager, isHR, isEmployee, isPayroll, rolesLoaded } = useRoles(user);

  // Determine primary user role
  const getUserRole = (): UserRole | null => {
    if (!user) return null;
    if (isAdmin) return 'admin';
    if (isHR) return 'hr';
    if (isManager) return 'manager';
    if (isPayroll) return 'payroll';
    if (isEmployee) return 'employee';
    return 'employee'; // default fallback
  };

  const userRole = getUserRole();

  useEffect(() => {
    let isMounted = true;

    console.log('🔄 AuthProvider: Setting up auth state listener');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔐 Auth state change event:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        // Handle refresh token errors that cause automatic logout
        if (event === 'TOKEN_REFRESHED') {
          console.log('📝 Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('📝 User signed out');
          // Clear any cached auth state
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_IN') {
          console.log('📝 User signed in successfully');
        }
        
        // Only update state if we have a valid session or explicit sign out
        if (session || event === 'SIGNED_OUT') {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      console.log('📋 Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Add debug logging for auth provider state
  useEffect(() => {
    console.log('🔐 AuthProvider roles state:', {
      isAdmin,
      isHR,
      isManager,
      isPayroll,
      isEmployee,
      rolesLoaded,
      userEmail: user?.email
    });
    
    // Set loading to false when roles are loaded or no user
    if (rolesLoaded || !user) {
      console.log('📝 Roles loaded or no user, setting loading to false', { user: !!user, rolesLoaded });
      setIsLoading(false);
    }
  }, [user, rolesLoaded, isAdmin, isHR, isManager, isPayroll, isEmployee]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isAdmin, 
      isManager, 
      isHR, 
      isEmployee,
      isPayroll,
      userRole, 
      rolesLoaded,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const isAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};
