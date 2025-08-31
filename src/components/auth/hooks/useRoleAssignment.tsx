
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/hooks/auth/types";

export const useRoleAssignment = () => {
  const { toast } = useToast();

  const assignUserRole = async (userId: string, userRole: UserRole): Promise<boolean> => {
    try {
      console.log('🔄 Assigning role via secure function:', { userId, userRole });
      
      // Use the secure server-side function for role assignment
      const { data, error } = await supabase.rpc('assign_user_role_secure', {
        target_user_id: userId,
        new_role: userRole
      });

      if (error) {
        console.error('❌ Error assigning role:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to assign role",
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        console.log('✅ Role assigned successfully via secure function');
        toast({
          title: "Success",
          description: `Role ${userRole} assigned successfully`,
        });
        return true;
      } else {
        console.error('❌ Role assignment failed:', data);
        toast({
          title: "Error",
          description: "Failed to assign role",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('💥 Exception in assignUserRole:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return { assignUserRole };
};
