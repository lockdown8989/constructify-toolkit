
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

export const useAuthActions = () => {
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

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link",
        });
      }
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });
      }
      return { error };
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut
  };
};
