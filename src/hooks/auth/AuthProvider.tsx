
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Use the roles hook
  const { isAdmin, isHR, isManager, isPayroll, rolesLoaded } = useRoles(user);
  const isEmployee = !isAdmin && !isHR && !isManager && !isPayroll;

  // Use auth actions hook
  const authActions = useAuthActions();

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change event:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setAuthError(null);
          
          // Only set loading to false after we've processed the auth state
          if (!session?.user || rolesLoaded) {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setAuthError(error instanceof Error ? error.message : 'Authentication error');
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthProvider: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error.message);
          setIsLoading(false);
          return;
        }
        
        console.log('📋 Initial session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // If no session, we can stop loading immediately
          if (!session?.user) {
            console.log('📝 No initial session, setting loading to false');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthError(error instanceof Error ? error.message : 'Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Update loading state when roles are loaded
  useEffect(() => {
    if (user && rolesLoaded) {
      console.log('📝 User and roles loaded, setting loading to false');
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

  // Show error state if there's an auth error
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <button 
            onClick={() => {
              setAuthError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
