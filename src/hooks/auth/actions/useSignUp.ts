
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling sign up functionality
 */
export const useSignUp = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log("Attempting to sign up:", email);
      
      if (!email || !password || !firstName || !lastName) {
        return {
          error: { 
            message: "All fields are required" 
          } as AuthError
        };
      }
      
      // Sign up the user with profile information
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          // Ensure email confirmation is respected based on Supabase settings
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      } 
      
      console.log("Sign up success, user:", data?.user?.id);
      
      // If user was created but confirmation is required, show different message
      if (data?.user && !data?.session) {
        console.log("User created but requires email confirmation");
        
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account before signing in.",
        });
        
        return { error: null, data, requiresConfirmation: true };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      return { 
        error: {
          message: errorMessage
        } as AuthError 
      };
    }
  };

  return { signUp };
};
