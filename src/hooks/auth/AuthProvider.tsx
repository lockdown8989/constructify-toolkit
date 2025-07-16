
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
          timestamp: new Date().toISOString()
        });
        
        // Handle user deletion or account removal - Fixed event type check
        if (event === 'SIGNED_OUT') {
          console.log('🔄 User signed out, clearing state');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          
          // Clear any cached data
          localStorage.clear();
          sessionStorage.clear();
          
          return;
        }
        
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
    // If we have a user but roles are still loading, keep showing authenticated state
    // Only set loading to false when either: no user OR roles are loaded
    if (!user) {
      console.log('📝 No user, setting loading to false');
      setIsLoading(false);
    } else if (rolesLoaded) {
      console.log('📝 User authenticated and roles loaded, setting loading to false');
      setIsLoading(false);
    } else {
      console.log('📝 User authenticated but roles still loading, keeping auth state');
      // Don't set loading to false yet - let roles finish loading
      // But ensure the user stays authenticated during role loading
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
