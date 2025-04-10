
import React, { createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';

// Create a context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isManager: true, // For testing, we'll make these true by default
  isAdmin: true,
  isHR: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signOut: async () => {},
});

// Create a hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Mock provider for demo purposes
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // This is a placeholder - in a real app, this would manage auth state
  return (
    <AuthContext.Provider 
      value={{ 
        user: { id: '123' } as any,
        session: { user: { id: '123' } } as any,
        isLoading: false,
        isAuthenticated: true,
        isManager: true,
        isAdmin: true,
        isHR: true,
        signIn: async () => ({ error: null }),
        signUp: async (email, password, firstName, lastName) => ({ error: null }),
        resetPassword: async (email) => ({ error: null }),
        updatePassword: async (password) => ({ error: null }),
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// For backward compatibility
export const isAuthenticated = () => true;
