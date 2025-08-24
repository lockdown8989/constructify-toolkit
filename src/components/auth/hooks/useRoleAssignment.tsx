
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/hooks/auth/types";

export const useRoleAssignment = () => {
  const { toast } = useToast();

  const assignUserRole = async (userId: string, userRole: UserRole) => {
    try {
      console.log(`🎯 Assigning role ${userRole} to user ${userId}`);
      
      // First check if user already has any roles
      const { data: existingRoles, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (roleCheckError) {
        console.error("Error checking existing roles:", roleCheckError);
        toast({
          title: "Error",
          description: "Could not check user roles: " + roleCheckError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Map the UI role to the database role - FIXED MAPPING
      let dbRole: string;
      
      switch (userRole) {
        case "admin":
          dbRole = "admin";
          break;
        case "hr":
          dbRole = "hr";
          break;
        case "payroll":
          dbRole = "payroll";
          break;
        default:
          dbRole = "employee";
      }
      
      console.log(`🔄 Mapped UI role ${userRole} to DB role ${dbRole}`);
      
      // Remove any existing roles first to avoid conflicts
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing roles:", deleteError);
      }
      
      // Insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: dbRole 
        });
          
      if (insertError) {
        console.error("Role insertion error:", insertError);
        toast({
          title: "Error",
          description: "Could not assign user role: " + insertError.message,
          variant: "destructive",
        });
        return false;
      } 
      
      console.log(`✅ Role ${dbRole} inserted successfully for user ${userId}`);
      return true;
    } catch (error) {
      console.error("💥 Role assignment error:", error);
      return false;
    }
  };

  return { assignUserRole };
};
