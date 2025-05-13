
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole, DBRole } from './types';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isManager: boolean;
  isAdmin: boolean;
  isHR: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  
  const isAdmin = roles.includes('admin');
  const isHR = roles.includes('hr');
  const isManager = roles.includes('manager');
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user as AuthUser ?? null);
        
        if (session?.user) {
          await fetchUserRoles(session.user.id);
        } else {
          setRoles([]);
        }
        
        setLoading(false);
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        setSession(sessionData.session);
        setUser(sessionData.session.user as AuthUser);
        
        if (sessionData.session.user) {
          await fetchUserRoles(sessionData.session.user.id);
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching user roles:", error);
        return;
      }
      
      // Map DB roles to UI roles
      const mappedRoles = data.map((r) => {
        const role = r.role as DBRole;
        return role === 'employer' ? 'manager' as UserRole : role as UserRole;
      });
      
      setRoles(mappedRoles);
    } catch (err) {
      console.error("Error in fetchUserRoles:", err);
    }
  };
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r));
    }
    return roles.includes(role);
  };
  
  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading: loading,
        isAuthenticated: !!user,
        roles,
        hasRole,
        isManager,
        isAdmin,
        isHR,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
