
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling sign in functionality with enhanced security
 */
export const useSignIn = () => {
  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return {
          error: {
            message: "Email and password are required"
          } as AuthError,
          data: undefined
        };
      }
      
      // Ensure email has no whitespace and is properly formatted
      const trimmedEmail = email.trim().toLowerCase();
      
      if (trimmedEmail.length > 254) {
        return {
          error: {
            message: "Email address is too long"
          } as AuthError,
          data: undefined
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      if (error) {
        // Don't log sensitive authentication details in production
        return { error, data: undefined };
      } else {
        return { error: null, data };
      }
    } catch (error) {
      return { 
        error: {
          message: error instanceof Error ? "Sign in failed" : "An unexpected error occurred"
        } as AuthError, 
        data: undefined 
      };
    }
  };

  return { signIn };
};
