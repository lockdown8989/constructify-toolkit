
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling password reset functionality
 */
export const usePasswordReset = () => {
  /**
   * Sends a password reset email to the specified email address
   */
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth?recovery=true`,
        }
      );
      
      if (error) {
        console.error('Password reset error:', error);
      } else {
        console.log('Password reset email sent');
      }
      
      return { data, error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        } as AuthError,
        data: undefined
      };
    }
  };
  
  /**
   * Updates the user's password
   */
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('Password update error:', error);
      } else {
        console.log('Password updated successfully');
      }
      
      return { data, error };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred"
        } as AuthError,
        data: undefined 
      };
    }
  };
  
  return { resetPassword, updatePassword };
};
