
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for handling sign out functionality
 */
export const useSignOut = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session check error:', sessionError);
        // Even with error, proceed with sign out attempt
      }
      
      if (!sessionData?.session) {
        console.log("No active session found, redirecting to auth page");
        // Clear any local state
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        navigate('/auth');
        return;
      }
      
      // We have a session or have attempted to check, proceed with signout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        
        // If the error is about a missing session, just redirect the user
        if (error.message?.includes('session') || error.name?.includes('Session')) {
          toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
          });
          navigate('/auth');
          return;
        }
        
        // For other errors, show the error but still try to clean up client-side
        toast({
          title: "Sign out partially completed",
          description: "You have been signed out but there was an issue: " + error.message,
          variant: "destructive",
        });
        
        // Still redirect to auth page
        setTimeout(() => navigate('/auth'), 1500);
        return;
      }
      
      console.log("Sign out successful");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Navigate to auth page after sign out
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Always reset UI state and redirect on any error
      toast({
        title: "Session ended",
        description: "Your session has been ended.",
      });
      navigate('/auth');
    }
  };

  return { signOut };
};
