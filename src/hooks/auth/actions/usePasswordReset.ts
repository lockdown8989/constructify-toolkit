
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling password reset functionality with enhanced security
 */
export const usePasswordReset = () => {
  /**
   * Sends a password reset email to the specified email address
   */
  const resetPassword = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail || trimmedEmail.length > 254) {
        return {
          error: {
            message: "Please enter a valid email address"
          } as AuthError,
          data: undefined
        };
      }
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}/auth?recovery=true`,
        }
      );
      
      // Always return success for security (don't reveal if email exists)
      return { data: { message: "If an account with this email exists, you will receive a password reset link." }, error: null };
    } catch (error) {
      return { 
        error: {
          message: "Unable to send reset email at this time"
        } as AuthError,
        data: undefined
      };
    }
  };
  
  /**
   * Updates the user's password with enhanced validation
   */
  const updatePassword = async (password: string) => {
    try {
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
      
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        return { error, data: undefined };
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        error: {
          message: "Unable to update password at this time"
        } as AuthError,
        data: undefined 
      };
    }
  };
  
  return { resetPassword, updatePassword };
};
