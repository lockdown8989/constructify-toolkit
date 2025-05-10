
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
  const { signIn, signUp: originalSignUp, resetPassword, updatePassword, signOut } = useAuthActions();

  // Create a wrapper around signUp that matches the expected signature
  const signUp = async (email: string, password: string, metadata?: any) => {
    // If metadata contains firstName and lastName, use them
    if (metadata?.firstName && metadata?.lastName) {
      return originalSignUp(email, password, metadata.firstName, metadata.lastName);
    }
    
    // Otherwise, use empty strings to satisfy the function signature
    return originalSignUp(email, password, metadata?.firstName || "", metadata?.lastName || "");
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up authentication");
    
    const setupAuth = async () => {
      try {
        setIsLoading(true);
        
        // CRITICAL: Set up auth listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, newSession?.user?.email);
            
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, clearing state");
              setUser(null);
              setSession(null);
              resetRoles();
              setIsLoading(false);
            } else if (newSession) {
              console.log("New session detected, updating state");
              setSession(newSession);
              setUser(newSession.user);
              
              if (newSession.user) {
                try {
                  await fetchUserRoles(newSession.user.id);
                } catch (error) {
                  console.error("Error fetching user roles:", error);
                }
              }
              
              setIsLoading(false);
            }
          }
        );

        // Then check current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Initial session check:", sessionData?.session?.user?.email || "No session");
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          
          if (sessionData.session.user) {
            try {
              await fetchUserRoles(sessionData.session.user.id);
            } catch (error) {
              console.error("Error fetching user roles:", error);
            }
          }
        }
        
        // Make sure we exit loading state even if initial session check fails
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

  // Calculate if user is authenticated - ensure both user and session exist
  const isAuthenticated = !!user && !!session;

  // Add proper debug logging
  useEffect(() => {
    console.log("Auth state updated:", { 
      isAuthenticated, 
      userId: user?.id,
      hasSession: !!session,
      isLoading
    });
  }, [isAuthenticated, user, session, isLoading]);

  const value: AuthContextType = {
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
