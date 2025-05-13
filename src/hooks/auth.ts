
// Re-export auth hooks from the new implementation
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { AuthUser, UserRole, DBRole } from './auth/types';

// Add specific exports for backward compatibility
export { AuthProvider } from './auth/AuthProvider';
export { useAuthActions } from './auth/useAuthActions';
export { type AuthUser, type UserRole };

// Legacy auth hook to be removed after migration is complete
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  
  const isAdmin = roles.includes('admin');
  const isHR = roles.includes('hr');
  const isManager = roles.includes('manager');
  const isAuthenticated = !!user;
  
  useEffect(() => {
    const setupAuth = async () => {
      try {
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
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user as AuthUser);
          
          if (sessionData.session.user) {
            await fetchUserRoles(sessionData.session.user.id);
          }
        }
        
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
        setLoading(false);
      }
    };
    
    setupAuth();
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
  
  // Re-export signout function
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  return {
    user,
    session,
    isLoading: loading,
    isAuthenticated,
    roles,
    hasRole,
    isManager,
    isAdmin,
    isHR,
    signOut
  };
};
