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
  
  // Use the roles hook
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
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