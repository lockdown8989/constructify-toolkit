
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

/**
 * Hook for handling password reset functionality
 */
export const usePasswordReset = () => {
  const { toast } = useToast();

  const resetPassword = async (email: string) => {
    try {
      // Get the current origin for creating the correct redirect URL
      const origin = window.location.origin;
      const resetRedirectUrl = `${origin}/auth?reset=true`;
      
      console.log(`Sending password reset to ${email} with redirect to: ${resetRedirectUrl}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link. If you don't see it, check your spam folder.",
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

  return { resetPassword, updatePassword };
};
