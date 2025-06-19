
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling sign out functionality
 */
export const useSignOut = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Sign out successful');
      
      // Clear any local storage items if needed
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        // Ignore localStorage errors
      }

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });

      // Navigate to auth page with sign out flag
      navigate('/auth?signout=true');
      
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  return { signOut };
};
