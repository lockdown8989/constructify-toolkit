
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

export const useSignInAction = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      
      // Make sure email and password are strings and not empty
      if (!email || !password) {
        return {
          error: {
            message: "Email and password are required"
          } as AuthError,
          data: undefined
        };
      }
      
      // Ensure email has no whitespace
      const trimmedEmail = email.trim();
      
      // Log the exact credentials being sent (without the password)
      console.log(`Signing in with email: "${trimmedEmail}"`);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error, data: undefined };
      } else {
        console.log("Sign in successful:", data.user?.email);
        return { error: null, data };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        } as AuthError, 
        data: undefined 
      };
    }
  };

  return { signIn };
};
