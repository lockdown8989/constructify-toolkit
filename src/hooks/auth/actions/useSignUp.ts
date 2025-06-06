
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling sign up functionality
 */
export const useSignUp = () => {
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log("Attempting to sign up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error, data: undefined };
      }
      
      console.log("Sign up successful:", data);
      return { error: null, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        } as AuthError, 
        data: undefined 
      };
    }
  };

  return { signUp };
};
