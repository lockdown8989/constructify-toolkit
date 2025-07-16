
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserRole } from './types';
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
  
  // Employee is anyone who is authenticated but doesn't have other roles - FIXED LOGIC
  const isEmployee = !!user && !isAdmin && !isHR && !isManager && !isPayroll;

  console.log("🔐 AuthProvider roles state:", {
    isAdmin,
    isHR, 
    isManager,
    isPayroll,
    isEmployee,
    rolesLoaded,
    userEmail: user?.email
  });

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
          timestamp: new Date().toISOString(),
          sessionExpires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });
        
        // Handle token refresh failures and auth errors
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
          setSession(session);
          setUser(session?.user ?? null);
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('🔄 User signed out or deleted, clearing state');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Handle authentication errors
        if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
          console.log('🔄 Password recovery or user update event');
          // Don't clear session for these events
          return;
        }
        
        // Update session and user state for all other events
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false if there's no user
        if (!session?.user) {
          console.log('📝 No user session, setting loading to false');
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

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
    }).catch((error) => {
      console.error('Exception in getSession:', error);
      setSession(null);
      setUser(null);
      setIsLoading(false);
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Update loading state - ensure auth persists regardless of role loading
  useEffect(() => {
    // If we have a user, they should stay authenticated regardless of role loading status
    if (user) {
      console.log('📝 User authenticated, setting loading to false regardless of roles');
      setIsLoading(false);
    } else if (!user) {
      console.log('📝 No user, setting loading to false');
      setIsLoading(false);
    }
  }, [user]);

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
    ...authActions, // This includes signIn, signUp, resetPassword, updatePassword, signOut, deleteAccount
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

export const isAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

export type { UserRole };
