
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
        // Set up auth state listener first to prevent race conditions
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            
            // Set loading to false immediately to prevent blank screens
            setIsLoading(false);
          }
        );
        
        // Then check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData?.session?.user?.email);
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
        
        setIsLoading(false);

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
