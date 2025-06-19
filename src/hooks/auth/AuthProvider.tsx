
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';
import { useAuthActions } from './useAuthActions';
import { useRoles } from './useRoles';
import { useAuthDebugger } from './useAuthDebugger';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the roles hook
  const { isAdmin, isHR, isManager, isPayroll, rolesLoaded } = useRoles(user);
  
  // Employee is anyone who is authenticated but doesn't have other roles
  const isEmployee = !!user && !isAdmin && !isHR && !isManager && !isPayroll;

  // Use auth actions hook
  const authActions = useAuthActions();

  // Add debugging hook
  useAuthDebugger({ user, session, isLoading });

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state change event:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after roles are loaded or user is null
        if (!session?.user) {
          console.log('📝 No user session, setting loading to false');
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // If no session, we can stop loading immediately
      if (!session?.user) {
        console.log('📝 No initial session, setting loading to false');
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Update loading state when roles are loaded or user is null
  useEffect(() => {
    if (!user || rolesLoaded) {
      console.log('📝 Roles loaded or no user, setting loading to false', { user: !!user, rolesLoaded });
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
    rolesLoaded,
    isAuthenticated: !!session?.user,
    ...authActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {session?.user && <SessionTimeoutWarning />}
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
