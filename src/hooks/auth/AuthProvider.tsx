
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useRoles } from "./useRoles";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isHR, isManager, fetchUserRoles, resetRoles } = useRoles(user);
  const { signIn, signUp, resetPassword, updatePassword, signOut } = useAuthActions();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // First check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData?.session?.user?.email);
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          
          if (sessionData.session.user) {
            await fetchUserRoles(sessionData.session.user.id);
          }
        }
        
        setIsLoading(false);
        
        // Then set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, newSession?.user?.email);
            
            // Update state based on the new session
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              await fetchUserRoles(newSession.user.id);
            } else {
              resetRoles();
            }
            
            // If the event is SIGNED_OUT, ensure we clear all auth state
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, clearing auth state");
              setUser(null);
              setSession(null);
              resetRoles();
            }
            
            setIsLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  // Calculate if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    isHR,
    isManager,
    isAuthenticated,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
