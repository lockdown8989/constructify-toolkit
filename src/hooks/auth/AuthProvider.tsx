import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserRole } from './types';
import { useAuthActions } from './useAuthActions';
import { useRoles } from './useRoles';
import { useAuthDebugger } from './useAuthDebugger';
import { useAuthMonitoring } from './useAuthMonitoring';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';
import { ErrorBoundary } from '@/components/auth/ErrorBoundary';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the roles hook
  const { isAdmin, isHR, isManager, isPayroll, rolesLoaded } = useRoles(user);
  
  // Employee is anyone who is authenticated but doesn't have other roles - Enhanced logic
  const isEmployee = !!user && rolesLoaded && !isAdmin && !isHR && !isManager && !isPayroll;

  // Use auth monitoring for realtime updates
  useAuthMonitoring(user);

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
    let mounted = true;
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change event:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
          sessionExpires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });
        
        // Update state for all events, but preserve existing session if new session is null
        // unless it's an explicit SIGNED_OUT event
        if (event === 'SIGNED_OUT') {
          console.log('🔄 Explicit sign out - clearing session');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Handle token refresh - always update if we get a new session
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed successfully');
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          return;
        }
        
        // Handle other events that shouldn't clear session
        if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
          console.log('🔄 Password recovery or user update event - maintaining existing session');
          return;
        }
        
        // For INITIAL_SESSION and SIGNED_IN events - only update if we have a session
        if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
          console.log(`🔄 ${event} event - updating session state`);
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          return;
        }
        
        // For INITIAL_SESSION with no session, only clear if we don't already have a session
        if (event === 'INITIAL_SESSION' && !session) {
          console.log('🔄 Initial session check - no session found');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // For any other events with valid session, update state
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
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
          timestamp: new Date().toISOString(),
          sessionExpires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('💥 Exception in getSession:', error);
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Optimized loading state - reduce auth loading time
  useEffect(() => {
    // Set loading to false as soon as we have user state determined
    if (user || session !== undefined) {
      console.log('📝 Auth state determined, stopping loading');
      setIsLoading(false);
    }
  }, [user, session]);

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
    <ErrorBoundary>
      <AuthContext.Provider value={value}>
        {children}
        {session?.user && <SessionTimeoutWarning />}
      </AuthContext.Provider>
    </ErrorBoundary>
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