
import { createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AuthContextType = {
  user: any;
  session: any;
  isAuthenticated: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isHR: boolean;
};

// Create a context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isManager: true, // For testing, we'll make these true by default
  isAdmin: true,
  isHR: true,
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
        user: { id: '123' },
        session: { user: { id: '123' } },
        isAuthenticated: true,
        isManager: true,
        isAdmin: true,
        isHR: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// For backward compatibility
export const isAuthenticated = () => true;
