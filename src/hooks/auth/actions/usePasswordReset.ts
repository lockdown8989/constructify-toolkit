
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";
import { sendNotification } from "@/services/notifications/notification-sender";

/**
 * Hook for handling password reset functionality
 * Uses configured SMTP settings in Supabase for sending emails
 */
export const usePasswordReset = () => {
  const { toast } = useToast();

  const resetPassword = async (email: string) => {
    try {
      // Get the current origin for creating the correct redirect URL
      const origin = window.location.origin;
      const resetRedirectUrl = `${origin}/auth?reset=true`;
      
      console.log(`Sending password reset to ${email} with redirect to: ${resetRedirectUrl}`);
      
      // This will use the SMTP configuration from Supabase dashboard (tampulseagent@gmail.com)
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
        return { error };
      }

      // Log the password reset request in the database
      try {
        await supabase.from('auth_events').insert({
          email: email,
          event_type: 'password_reset_requested',
          timestamp: new Date().toISOString(),
          sender_email: 'tampulseagent@gmail.com' // Using the configured sender
        });
        console.log('Password reset request logged in database');
        
        // Notify system admins about the password reset request
        await sendNotification({
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          title: "Password Reset Requested",
          message: `A password reset was requested for ${email}`,
          type: "info",
          related_entity: 'auth',
          related_id: email
        });
      } catch (logError) {
        // Don't fail the reset if logging fails
        console.warn('Could not log password reset to database:', logError);
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link from TeamPulse. If you don't see it, check your spam folder.",
      });
      
      return { error: null };
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
      const { error, data } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Log the password update in the database
      try {
        await supabase.from('auth_events').insert({
          email: data.user.email || '',
          event_type: 'password_reset_completed',
          timestamp: new Date().toISOString(),
          sender_email: 'tampulseagent@gmail.com' // Using the configured sender
        });
        console.log('Password update logged in database');
      } catch (logError) {
        // Don't fail the update if logging fails
        console.warn('Could not log password update to database:', logError);
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      return { error: null, user: data.user };
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
