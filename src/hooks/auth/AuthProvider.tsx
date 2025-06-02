
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';
import { useAuthActions } from './useAuthActions';
import { useRoles } from './useRoles';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the roles hook
  const { isAdmin, isHR, isManager, isPayroll, rolesLoaded } = useRoles(user);
  const isEmployee = !isAdmin && !isHR && !isManager && !isPayroll;

  // Use auth actions hook
  const authActions = useAuthActions();

  // Debug log to check all roles
  useEffect(() => {
    if (user && rolesLoaded) {
      console.log("AuthProvider - All roles:", { isAdmin, isHR, isManager, isPayroll, isEmployee });
    }
  }, [user, rolesLoaded, isAdmin, isHR, isManager, isPayroll, isEmployee]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after roles are loaded or user is null
        if (!session?.user) {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // If no session, we can stop loading immediately
      if (!session?.user) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update loading state when roles are loaded
  useEffect(() => {
    if (user && rolesLoaded) {
      setIsLoading(false);
    }
  }, [user, rolesLoaded]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAdmin,
    isHR,
    isManager,
    isEmployee,
    isPayroll,
    isAuthenticated: !!session?.user,
    ...authActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
