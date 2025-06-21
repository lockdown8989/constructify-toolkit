
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling password reset using custom Resend email service
 */
export const useCustomPasswordReset = () => {
  /**
   * Sends a password reset email using custom Resend service
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
      
      console.log("Calling send-password-reset function with email:", trimmedEmail);
      
      // Call our custom edge function instead of Supabase's built-in reset
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: trimmedEmail }
      });
      
      console.log("Edge function response:", { data, error });
      
      if (error) {
        console.error("Password reset error:", error);
        return { 
          error: {
            message: "Unable to send reset email at this time. Please try again."
          } as AuthError,
          data: undefined
        };
      }
      
      // Always return success message for security
      return { 
        data: { 
          message: "If an account with this email exists, you will receive a password reset link." 
        }, 
        error: null 
      };
    } catch (error) {
      console.error("Exception in resetPassword:", error);
      return { 
        error: {
          message: "Unable to send reset email at this time. Please try again."
        } as AuthError,
        data: undefined
      };
    }
  };
  
  return { resetPassword };
};
