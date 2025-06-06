
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling sign up functionality with enhanced security
 */
export const useSignUp = () => {
  const signUp = async (email: string, password: string, metadata?: any) => {
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
      
      // Enhanced password validation
      if (password.length < 8) {
        return {
          error: {
            message: "Password must be at least 8 characters long"
          } as AuthError,
          data: undefined
        };
      }
      
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
          error: {
            message: "Password must contain uppercase, lowercase, number, and special character"
          } as AuthError,
          data: undefined
        };
      }
      
      const trimmedEmail = email.trim().toLowerCase();
      
      if (trimmedEmail.length > 254) {
        return {
          error: {
            message: "Email address is too long"
          } as AuthError,
          data: undefined
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });
      
      if (error) {
        return { error, data: undefined };
      }
      
      return { error: null, data };
    } catch (error) {
      return { 
        error: {
          message: error instanceof Error ? "Sign up failed" : "An unexpected error occurred"
        } as AuthError, 
        data: undefined 
      };
    }
  };

  return { signUp };
};
